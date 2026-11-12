import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { User } from '@/models/User';
import {
  authService,
  type LoginDto,
  type RegisterDto,
  type UpdateUserDto,
} from '@/services/authService';
import { getAuthError, type AuthError } from '@/utils/getAuthError';

interface UserState {
  current: User | null;
  loading: boolean;
  initialized: boolean;
  error: AuthError | null;
}

interface UserThunkConfig {
  state: { user: UserState };
  rejectValue: AuthError;
}

const initialState: UserState = {
  current: null,
  loading: false,
  initialized: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk<
  User | null,
  void,
  UserThunkConfig
>(
  'user/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.me();
    } catch (error) {
      const authError = getAuthError(error);
      if (authError.status === 401) return null;
      return rejectWithValue(authError);
    }
  },
  {
    condition: (_, { getState }) => !getState().user.loading,
  },
);

export const loginUser = createAsyncThunk<User, LoginDto, UserThunkConfig>(
  'user/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload);
    } catch (error) {
      return rejectWithValue(getAuthError(error));
    }
  },
  { condition: (_, { getState }) => !getState().user.loading },
);

export const registerUser = createAsyncThunk<
  User,
  RegisterDto,
  UserThunkConfig
>(
  'user/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.register(payload);
    } catch (error) {
      return rejectWithValue(getAuthError(error));
    }
  },
  { condition: (_, { getState }) => !getState().user.loading },
);

export const updateUser = createAsyncThunk<
  User,
  UpdateUserDto,
  UserThunkConfig
>(
  'user/update',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.updateMe(payload);
    } catch (error) {
      return rejectWithValue(getAuthError(error));
    }
  },
  { condition: (_, { getState }) => !getState().user.loading },
);

export const logoutUser = createAsyncThunk<null, void, UserThunkConfig>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      const authError = getAuthError(error);
      return rejectWithValue(authError);
    }
  },
  {
    condition: (_, { getState }) => !getState().user.loading,
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(
          fetchCurrentUser.pending,
          loginUser.pending,
          registerUser.pending,
          updateUser.pending,
          logoutUser.pending,
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchCurrentUser.fulfilled,
          loginUser.fulfilled,
          registerUser.fulfilled,
          updateUser.fulfilled,
          logoutUser.fulfilled,
        ),
        (state, action) => {
          state.current = action.payload;
          state.loading = false;
          state.initialized = true;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchCurrentUser.rejected,
          loginUser.rejected,
          registerUser.rejected,
          updateUser.rejected,
          logoutUser.rejected,
        ),
        (state, action) => {
          state.loading = false;
          state.initialized = true;
          state.error = action.payload ?? getAuthError(action.error);
        },
      );
  },
});

export const { clearUserError } = userSlice.actions;
