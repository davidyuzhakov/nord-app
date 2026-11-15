import {
  createSlice,
  createAsyncThunk,
  isAnyOf,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Program, ProgramSong } from '@/models/Program';
import {
  programService,
  type CreateProgramDto,
  type UpdateProgramDto,
  type UpdateProgramSongDto,
} from '@/services/programService';
import type { ChurchSong } from '@/models/Song';
import { getAuthError } from '@/utils/getAuthError';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  setActiveChurchId,
} from './userSlice';
import { deleteSongThunk, updateSongThunk } from './songSlice';
import { libraryCacheMaxAge } from '@/utils/songCatalog';

interface ProgramState {
  items: Program[];
  current: Program | null;
  failedProgramId: number | null;
  currentSong: ProgramSong | null;
  loading: boolean;
  addedSong: ChurchSong | null;
  error: string | null;
  listRequestId: string | null;
  listFetchedAt: number | null;
  currentRequestId: string | null;
  songRequestId: string | null;
  mutationRequestId: string | null;
}
interface ProgramThunkConfig {
  state: { program: ProgramState };
  rejectValue: string;
}
const initialState: ProgramState = {
  items: [],
  current: null,
  failedProgramId: null,
  currentSong: null,
  loading: false,
  addedSong: null,
  error: null,
  listRequestId: null,
  listFetchedAt: null,
  currentRequestId: null,
  songRequestId: null,
  mutationRequestId: null,
};
const syncLoading = (state: ProgramState) => {
  state.loading = Boolean(
    state.listRequestId ||
    state.currentRequestId ||
    state.songRequestId ||
    state.mutationRequestId,
  );
};
const canMutate = (
  _: unknown,
  { getState }: { getState: () => { program: ProgramState } },
) => !getState().program.mutationRequestId;

export const fetchPrograms = createAsyncThunk<
  Program[],
  { preferCached: boolean } | void,
  ProgramThunkConfig & { fulfilledMeta: { fetchedAt: number } }
>(
  'program/fetchAll',
  async (_, { rejectWithValue, fulfillWithValue, signal }) => {
    try {
      const programs = await programService.getAllPrograms(signal);
      return fulfillWithValue(programs, { fetchedAt: Date.now() });
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  {
    condition: (options, { getState }) => {
      const { listRequestId, listFetchedAt } = getState().program;
      if (listRequestId) return false;
      return (
        !options?.preferCached ||
        !listFetchedAt ||
        Date.now() - listFetchedAt >= libraryCacheMaxAge
      );
    },
  },
);
export const fetchProgram = createAsyncThunk<
  Program,
  number,
  ProgramThunkConfig
>('program/fetchOne', async (id, { rejectWithValue, signal }) => {
  try {
    return await programService.getProgram(id, signal);
  } catch (error) {
    return rejectWithValue(getAuthError(error).messages.join('\n'));
  }
});
export const fetchProgramSong = createAsyncThunk<
  ProgramSong,
  { programId: number; songId: number },
  ProgramThunkConfig
>(
  'program/fetchSong',
  async ({ programId, songId }, { rejectWithValue, signal }) => {
    try {
      return await programService.getProgramSong(programId, songId, signal);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
);
export const createProgramThunk = createAsyncThunk<
  Program,
  CreateProgramDto,
  ProgramThunkConfig
>(
  'program/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await programService.createProgram(payload);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: canMutate },
);
export const updateProgramThunk = createAsyncThunk<
  Program,
  { id: number; data: UpdateProgramDto },
  ProgramThunkConfig
>(
  'program/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await programService.updateProgram(id, data);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: canMutate },
);
export const deleteProgramThunk = createAsyncThunk<
  number,
  number,
  ProgramThunkConfig
>(
  'program/delete',
  async (id, { rejectWithValue }) => {
    try {
      await programService.deleteProgram(id);
      return id;
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: canMutate },
);
export const updateProgramSongThunk = createAsyncThunk<
  ProgramSong,
  { programId: number; songId: number; data: UpdateProgramSongDto },
  ProgramThunkConfig
>(
  'program/updateSong',
  async ({ programId, songId, data }, { rejectWithValue }) => {
    try {
      return await programService.updateProgramSong(programId, songId, data);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: canMutate },
);

export const programSlice = createSlice({
  name: 'program',
  initialState,
  reducers: {
    destroyAddedSong: (state) => {
      state.addedSong = null;
    },
    insertAddedSong: (state, action: PayloadAction<ChurchSong>) => {
      state.addedSong = action.payload;
    },
    clearProgramError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (_state, action) => {
        if (!action.payload) return initialState;
      })
      .addCase(fetchPrograms.pending, (state, action) => {
        state.listRequestId = action.meta.requestId;
        syncLoading(state);
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.listRequestId = null;
        state.listFetchedAt = action.meta.fetchedAt;
        state.items = action.payload;
        syncLoading(state);
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.listRequestId = null;
        if (!action.meta.aborted)
          state.error = action.payload ?? 'Не удалось загрузить программы.';
        syncLoading(state);
      })
      .addCase(fetchProgram.pending, (state, action) => {
        state.current = null;
        state.failedProgramId = null;
        state.currentRequestId = action.meta.requestId;
        syncLoading(state);
      })
      .addCase(fetchProgram.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        state.current = action.payload;
        syncLoading(state);
      })
      .addCase(fetchProgram.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        if (!action.meta.aborted) {
          state.failedProgramId = action.meta.arg;
          state.error = action.payload ?? 'Не удалось загрузить программу.';
        }
        syncLoading(state);
      })
      .addCase(fetchProgramSong.pending, (state, action) => {
        state.currentSong = null;
        state.songRequestId = action.meta.requestId;
        syncLoading(state);
      })
      .addCase(fetchProgramSong.fulfilled, (state, action) => {
        if (state.songRequestId !== action.meta.requestId) return;
        state.songRequestId = null;
        state.currentSong = action.payload;
        syncLoading(state);
      })
      .addCase(fetchProgramSong.rejected, (state, action) => {
        if (state.songRequestId !== action.meta.requestId) return;
        state.songRequestId = null;
        if (!action.meta.aborted)
          state.error =
            action.payload ?? 'Не удалось загрузить хвалу программы.';
        syncLoading(state);
      })
      .addCase(updateProgramSongThunk.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        const updatedSong = action.payload;
        if (
          state.currentSong?.programId === updatedSong.programId &&
          state.currentSong.songId === updatedSong.songId
        )
          state.currentSong = updatedSong;
        for (const program of [
          ...state.items,
          ...(state.current ? [state.current] : []),
        ]) {
          if (program.id !== updatedSong.programId) continue;
          const index = program.songs.findIndex(
            (song) => song.songId === updatedSong.songId,
          );
          if (index !== -1) {
            program.songs[index] = updatedSong;
            program.songs.sort((a, b) => a.order - b.order);
          }
        }
      })
      .addCase(deleteProgramThunk.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.items = state.items.filter(
          (program) => program.id !== action.payload,
        );
        if (state.current?.id === action.payload) state.current = null;
        if (state.currentSong?.programId === action.payload)
          state.currentSong = null;
      })
      .addCase(updateSongThunk.fulfilled, (state, action) => {
        if (
          action.meta.arg.catalog !== 'church' ||
          !('churchId' in action.payload)
        )
          return;
        const song = action.payload;
        for (const program of [
          ...state.items,
          ...(state.current ? [state.current] : []),
        ]) {
          for (const item of program.songs) {
            if (item.songId === song.id) item.song = song;
          }
        }
        if (state.currentSong?.songId === song.id)
          state.currentSong.song = song;
        if (state.addedSong?.id === song.id) state.addedSong = song;
      })
      .addCase(deleteSongThunk.fulfilled, (state, action) => {
        const { catalog, id } = action.payload;
        for (const program of [
          ...state.items,
          ...(state.current ? [state.current] : []),
        ]) {
          if (catalog === 'church')
            program.songs = program.songs.filter((song) => song.songId !== id);
          else
            for (const item of program.songs) {
              if (item.song.sourceSongId === id) item.song.sourceSongId = null;
            }
        }
        if (catalog === 'church') {
          if (state.currentSong?.songId === id) state.currentSong = null;
          if (state.addedSong?.id === id) state.addedSong = null;
        }
      })
      .addMatcher(
        isAnyOf(
          loginUser.fulfilled,
          registerUser.fulfilled,
          logoutUser.fulfilled,
          setActiveChurchId,
        ),
        () => initialState,
      )
      .addMatcher(
        isAnyOf(createProgramThunk.fulfilled, updateProgramThunk.fulfilled),
        (state, action) => {
          if (state.mutationRequestId !== action.meta.requestId) return;
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id,
          );
          if (index === -1) state.items.push(action.payload);
          else state.items[index] = action.payload;
          state.current = action.payload;
        },
      )
      .addMatcher(
        isAnyOf(
          createProgramThunk.pending,
          updateProgramThunk.pending,
          deleteProgramThunk.pending,
          updateProgramSongThunk.pending,
        ),
        (state, action) => {
          state.mutationRequestId = action.meta.requestId;
          syncLoading(state);
        },
      )
      .addMatcher(
        isAnyOf(
          createProgramThunk.fulfilled,
          updateProgramThunk.fulfilled,
          deleteProgramThunk.fulfilled,
          updateProgramSongThunk.fulfilled,
        ),
        (state, action) => {
          if (state.mutationRequestId !== action.meta.requestId) return;
          state.mutationRequestId = null;
          syncLoading(state);
        },
      )
      .addMatcher(
        isAnyOf(
          createProgramThunk.rejected,
          updateProgramThunk.rejected,
          deleteProgramThunk.rejected,
          updateProgramSongThunk.rejected,
        ),
        (state, action) => {
          if (state.mutationRequestId !== action.meta.requestId) return;
          state.mutationRequestId = null;
          state.error = action.payload ?? 'Не удалось сохранить программу.';
          syncLoading(state);
        },
      );
  },
});

export const { destroyAddedSong, insertAddedSong, clearProgramError } =
  programSlice.actions;
