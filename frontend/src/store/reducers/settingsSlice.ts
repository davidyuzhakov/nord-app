import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type TMode = 'night' | 'day';
type THideChords = 'on' | 'off';

export const SONG_FONT_SIZE = { min: 12, max: 16, default: 14 };

function normalizeSongFontSize(value: number) {
  if (!Number.isFinite(value)) return SONG_FONT_SIZE.default;

  return Math.min(
    SONG_FONT_SIZE.max,
    Math.max(SONG_FONT_SIZE.min, Math.round(value)),
  );
}

interface SettingsState {
  mode: TMode;
  hideChords: THideChords;
  songFontSize: number;
}

const initialState: SettingsState = {
  mode: (localStorage.getItem('mode') as TMode) ?? 'day',
  hideChords: (localStorage.getItem('hide-chords') as THideChords) ?? 'off',
  songFontSize: normalizeSongFontSize(
    Number(localStorage.getItem('song-font-size') ?? SONG_FONT_SIZE.default),
  ),
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateHideChords: (state, action: PayloadAction<THideChords>) => {
      state.hideChords = action.payload;
      localStorage.setItem('hide-chords', action.payload);
    },
    updateMode: (state, action: PayloadAction<TMode>) => {
      state.mode = action.payload;
      localStorage.setItem('mode', action.payload);
    },
    updateSongFontSize: (state, action: PayloadAction<number>) => {
      state.songFontSize = normalizeSongFontSize(action.payload);
      localStorage.setItem('song-font-size', String(state.songFontSize));
    },
  },
});

export const { updateHideChords, updateMode, updateSongFontSize } =
  settingsSlice.actions;
