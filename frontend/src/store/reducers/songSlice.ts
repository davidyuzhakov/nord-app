import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import { libraryCacheMaxAge } from '@/utils/songCatalog';
import type { ChurchSong, LibrarySong, SongCatalog } from '@/models/Song';
import {
  songService,
  type CreateSongDto,
  type UpdateSongDto,
  type GetSongsParams,
  type SongReference,
} from '@/services/songService';
import { getAuthError } from '@/utils/getAuthError';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  setActiveChurchId,
} from './userSlice';

interface SongList {
  search: string;
  visitId?: string;
  items: LibrarySong[];
  requestId: string | null;
  fetchedAt: number | null;
}

interface SongState {
  lists: Record<SongCatalog, { all?: SongList; search?: SongList }>;
  current: LibrarySong | null;
  currentCatalog: SongCatalog | null;
  currentLoading: boolean;
  failedSong: SongReference | null;
  mutating: boolean;
  error: string | null;
  currentRequestId: string | null;
  mutationRequestId: string | null;
}

interface SongThunkConfig {
  state: { song: SongState };
  rejectValue: string;
}

const initialState: SongState = {
  lists: { general: {}, church: {} },
  current: null,
  currentCatalog: null,
  currentLoading: false,
  failedSong: null,
  mutating: false,
  error: null,
  currentRequestId: null,
  mutationRequestId: null,
};

export function selectSongList(
  state: SongState,
  { catalog, search = '' }: GetSongsParams,
) {
  const list = state.lists[catalog][search ? 'search' : 'all'];
  return list?.search === search ? list : undefined;
}

export const fetchSongs = createAsyncThunk<
  LibrarySong[],
  GetSongsParams & { visitId?: string },
  SongThunkConfig & { fulfilledMeta: { fetchedAt: number } }
>(
  'song/fetchAll',
  async (params, { rejectWithValue, fulfillWithValue, signal }) => {
    try {
      const songs = await songService.getAllSongs(params, signal);
      return fulfillWithValue(songs, { fetchedAt: Date.now() });
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  {
    condition: (params, { getState }) => {
      const list = selectSongList(getState().song, params);
      if (params.visitId && params.visitId !== list?.visitId) return true;
      return (
        !list?.requestId &&
        (!list?.fetchedAt || Date.now() - list.fetchedAt >= libraryCacheMaxAge)
      );
    },
  },
);

export const fetchSong = createAsyncThunk<
  LibrarySong,
  SongReference,
  SongThunkConfig
>('song/fetchOne', async (reference, { rejectWithValue, signal }) => {
  try {
    return await songService.getSong(reference, signal);
  } catch (error) {
    return rejectWithValue(getAuthError(error).messages.join('\n'));
  }
});

export const createSongThunk = createAsyncThunk<
  LibrarySong,
  { catalog: SongCatalog; data: CreateSongDto },
  SongThunkConfig
>(
  'song/create',
  async ({ catalog, data }, { rejectWithValue }) => {
    try {
      return await songService.createSong(catalog, data);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().song.mutating },
);

export const addCatalogSongThunk = createAsyncThunk<
  ChurchSong,
  number,
  SongThunkConfig
>(
  'song/addFromCatalog',
  async (songId, { rejectWithValue }) => {
    try {
      return await songService.addFromCatalog(songId);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().song.mutating },
);

export const updateSongThunk = createAsyncThunk<
  LibrarySong,
  SongReference & { data: UpdateSongDto },
  SongThunkConfig
>(
  'song/update',
  async ({ data, ...reference }, { rejectWithValue }) => {
    try {
      return await songService.updateSong(reference, data);
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().song.mutating },
);

export const deleteSongThunk = createAsyncThunk<
  SongReference,
  SongReference,
  SongThunkConfig
>(
  'song/delete',
  async (reference, { rejectWithValue }) => {
    try {
      await songService.deleteSong(reference);
      return reference;
    } catch (error) {
      return rejectWithValue(getAuthError(error).messages.join('\n'));
    }
  },
  { condition: (_, { getState }) => !getState().song.mutating },
);

// An older in-flight response must not overwrite a completed mutation.
function validLists(state: SongState, catalog: SongCatalog) {
  const lists = state.lists[catalog];
  for (const key of ['all', 'search'] as const) {
    if (lists[key]?.requestId) delete lists[key];
  }
  return Object.values(lists);
}

function cachedSongs(state: SongState, catalog: SongCatalog) {
  const songs = validLists(state, catalog).flatMap((list) => list.items);
  if (state.current && state.currentCatalog === catalog)
    songs.push(state.current);
  return songs;
}

export const songSlice = createSlice({
  name: 'song',
  initialState,
  reducers: {
    clearSongError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (_state, action) => {
        if (!action.payload) return initialState;
      })
      .addCase(fetchSongs.pending, (state, action) => {
        const { catalog, search = '', visitId } = action.meta.arg;
        const previous = selectSongList(state, action.meta.arg);
        state.lists[catalog][search ? 'search' : 'all'] = {
          search,
          visitId,
          items: previous?.items ?? [],
          fetchedAt: previous?.fetchedAt ?? null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        const list = selectSongList(state, action.meta.arg);
        if (list?.requestId !== action.meta.requestId) return;
        list.requestId = null;
        list.items = action.payload;
        list.fetchedAt = action.meta.fetchedAt;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        const list = selectSongList(state, action.meta.arg);
        if (list?.requestId !== action.meta.requestId) return;
        list.requestId = null;
        if (!action.meta.aborted)
          state.error = action.payload ?? 'Не удалось загрузить хвалы.';
      })
      .addCase(fetchSong.pending, (state, action) => {
        state.currentLoading = true;
        state.failedSong = null;
        state.current = null;
        state.currentCatalog = action.meta.arg.catalog;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchSong.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentLoading = false;
        state.currentRequestId = null;
        state.current = action.payload;
      })
      .addCase(fetchSong.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentLoading = false;
        state.currentRequestId = null;
        if (action.meta.aborted) return;
        state.failedSong = action.meta.arg;
        state.error = action.payload ?? 'Не удалось загрузить хвалу.';
      })
      .addCase(addCatalogSongThunk.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.lists.church = {};
        for (const song of cachedSongs(state, 'general')) {
          if ('churchSongId' in song && song.id === action.meta.arg)
            song.churchSongId = action.payload.id;
        }
      })
      .addCase(deleteSongThunk.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        const { catalog, id } = action.payload;
        if (state.currentCatalog === catalog && state.current?.id === id)
          state.current = null;
        for (const list of validLists(state, catalog)) {
          list.items = list.items.filter((song) => song.id !== id);
        }
        const otherCatalog = catalog === 'church' ? 'general' : 'church';
        for (const song of cachedSongs(state, otherCatalog)) {
          if ('churchSongId' in song && song.churchSongId === id)
            song.churchSongId = null;
          if ('sourceSongId' in song && song.sourceSongId === id)
            song.sourceSongId = null;
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
        isAnyOf(createSongThunk.fulfilled, updateSongThunk.fulfilled),
        (state, action) => {
          if (state.mutationRequestId !== action.meta.requestId) return;
          const { catalog } = action.meta.arg;
          state.lists[catalog] = {};
          if (
            state.currentCatalog === catalog &&
            state.current?.id === action.payload.id
          ) {
            state.current = { ...state.current, ...action.payload };
          }
        },
      )
      .addMatcher(
        isAnyOf(
          createSongThunk.pending,
          updateSongThunk.pending,
          deleteSongThunk.pending,
          addCatalogSongThunk.pending,
        ),
        (state, action) => {
          state.mutating = true;
          state.mutationRequestId = action.meta.requestId;
        },
      )
      .addMatcher(
        isAnyOf(
          createSongThunk.fulfilled,
          updateSongThunk.fulfilled,
          deleteSongThunk.fulfilled,
          addCatalogSongThunk.fulfilled,
        ),
        (state, action) => {
          if (state.mutationRequestId !== action.meta.requestId) return;
          state.mutating = false;
          state.mutationRequestId = null;
        },
      )
      .addMatcher(
        isAnyOf(
          createSongThunk.rejected,
          updateSongThunk.rejected,
          deleteSongThunk.rejected,
          addCatalogSongThunk.rejected,
        ),
        (state, action) => {
          if (state.mutationRequestId !== action.meta.requestId) return;
          state.mutating = false;
          state.mutationRequestId = null;
          if (!action.meta.aborted)
            state.error = action.payload ?? 'Не удалось сохранить изменения.';
        },
      );
  },
});

export const { clearSongError } = songSlice.actions;
