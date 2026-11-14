import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { Church, ChurchInvite } from '@/models/Church';
import {
  churchService,
  type CreateChurchDto,
  type UpdateChurchDto,
} from '@/services/churchService';
import { getAuthError } from '@/utils/getAuthError';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  setActiveChurchId,
} from './userSlice';

interface ChurchState {
  items: Church[];
  loading: boolean;
  error: string | null;
  requestId: string | null;
  invite: ChurchInvite | null;
  inviteToken: string | null;
  inviteLoading: boolean;
  inviteError: string | null;
  inviteRequestId: string | null;
}

interface ChurchThunkConfig {
  state: { church: ChurchState };
  rejectValue: string;
}

const initialState: ChurchState = {
  items: [],
  loading: false,
  error: null,
  requestId: null,
  invite: null,
  inviteToken: null,
  inviteLoading: false,
  inviteError: null,
  inviteRequestId: null,
};

export const fetchChurches = createAsyncThunk<
  Church[],
  void,
  ChurchThunkConfig
>(
  'church/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await churchService.getAllChurches();
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().church.loading },
);

export const fetchChurchInvite = createAsyncThunk<
  ChurchInvite,
  string,
  ChurchThunkConfig
>('church/fetchInvite', async (inviteToken, { rejectWithValue, signal }) => {
  try {
    return await churchService.getChurchInvite(inviteToken, signal);
  } catch (error) {
    return rejectWithValue(getAuthError(error).messages.join('\n'));
  }
});

export const createChurchThunk = createAsyncThunk<
  Church,
  CreateChurchDto,
  ChurchThunkConfig
>(
  'church/create',
  async (payload, { dispatch, getState, requestId, rejectWithValue }) => {
    try {
      const church = await churchService.createChurch(payload);
      if (getState().church.requestId === requestId) {
        dispatch(setActiveChurchId(church.id));
      }
      return church;
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().church.loading },
);

export const joinChurchThunk = createAsyncThunk<
  Church,
  string,
  ChurchThunkConfig
>(
  'church/join',
  async (inviteToken, { dispatch, getState, requestId, rejectWithValue }) => {
    try {
      const church = await churchService.joinChurch(inviteToken);
      if (getState().church.requestId === requestId) {
        dispatch(setActiveChurchId(church.id));
      }
      return church;
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().church.loading },
);

export const switchChurchThunk = createAsyncThunk<
  string,
  string,
  ChurchThunkConfig
>(
  'church/switch',
  async (churchId, { dispatch, getState, requestId, rejectWithValue }) => {
    try {
      const { activeChurchId } = await churchService.setCurrentChurch(churchId);
      if (getState().church.requestId === requestId) {
        dispatch(setActiveChurchId(activeChurchId));
      }
      return activeChurchId;
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().church.loading },
);

export const updateChurchThunk = createAsyncThunk<
  Church,
  { id: string; data: UpdateChurchDto },
  ChurchThunkConfig
>(
  'church/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await churchService.updateChurch(id, data);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().church.loading },
);

export const deleteChurchThunk = createAsyncThunk<
  string,
  string,
  ChurchThunkConfig
>(
  'church/delete',
  async (churchId, { dispatch, getState, requestId, rejectWithValue }) => {
    try {
      const { activeChurchId } = await churchService.deleteChurch(churchId);
      if (getState().church.requestId === requestId) {
        dispatch(setActiveChurchId(activeChurchId));
      }
      return churchId;
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().church.loading },
);

export const churchSlice = createSlice({
  name: 'church',
  initialState,
  reducers: {
    clearChurchError: (state) => {
      state.error = null;
      state.inviteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (_state, action) => {
        if (!action.payload) return initialState;
      })
      .addCase(switchChurchThunk.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.requestId = null;
      })
      .addCase(deleteChurchThunk.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.items = state.items.filter(
          (church) => church.id !== action.payload,
        );
        state.loading = false;
        state.requestId = null;
      })
      .addCase(fetchChurchInvite.pending, (state, action) => {
        state.invite = null;
        state.inviteToken = action.meta.arg;
        state.inviteLoading = true;
        state.inviteError = null;
        state.inviteRequestId = action.meta.requestId;
      })
      .addCase(fetchChurchInvite.fulfilled, (state, action) => {
        if (state.inviteRequestId !== action.meta.requestId) return;
        state.invite = action.payload;
        state.inviteLoading = false;
        state.inviteRequestId = null;
      })
      .addCase(fetchChurchInvite.rejected, (state, action) => {
        if (state.inviteRequestId !== action.meta.requestId) return;
        state.inviteLoading = false;
        state.inviteRequestId = null;
        if (!action.meta.aborted) {
          state.inviteError =
            action.payload ?? 'Не удалось загрузить приглашение.';
        }
      })
      .addMatcher(
        isAnyOf(
          loginUser.fulfilled,
          registerUser.fulfilled,
          logoutUser.fulfilled,
        ),
        () => initialState,
      )
      .addMatcher(
        isAnyOf(
          fetchChurches.pending,
          createChurchThunk.pending,
          joinChurchThunk.pending,
          switchChurchThunk.pending,
          updateChurchThunk.pending,
          deleteChurchThunk.pending,
        ),
        (state, action) => {
          state.loading = true;
          state.error = null;
          state.requestId = action.meta.requestId;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchChurches.fulfilled,
          createChurchThunk.fulfilled,
          joinChurchThunk.fulfilled,
          updateChurchThunk.fulfilled,
        ),
        (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          state.loading = false;
          state.requestId = null;
          if (fetchChurches.fulfilled.match(action)) {
            state.items = action.payload;
          } else {
            const church = action.payload;
            const index = state.items.findIndex(
              (item) => item.id === church.id,
            );
            if (index === -1) state.items.push(church);
            else state.items[index] = church;
          }
        },
      )
      .addMatcher(
        isAnyOf(
          fetchChurches.rejected,
          createChurchThunk.rejected,
          joinChurchThunk.rejected,
          switchChurchThunk.rejected,
          updateChurchThunk.rejected,
          deleteChurchThunk.rejected,
        ),
        (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          state.loading = false;
          state.requestId = null;
          state.error = action.payload ?? 'Не удалось выполнить запрос.';
        },
      );
  },
});

export const { clearChurchError } = churchSlice.actions;
