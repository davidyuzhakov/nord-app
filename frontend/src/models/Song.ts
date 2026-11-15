export interface Song {
  id: number;
  name: string;
  key: KeyType;
  bpm: number;
  text: string;
  structure?: SongStructureItem[] | null;
  danceVideo?: string | null;
  audio?: string | null;
}

export type SongCatalog = 'general' | 'church';

export interface CatalogSong extends Song {
  churchSongId: number | null;
}

export interface ChurchSong extends Song {
  churchId: string;
  sourceSongId: number | null;
}

export type LibrarySong = CatalogSong | ChurchSong;

export type SongStructureItem = {
  id: string;
  title: string;
  text: string;
  amount: number;
};

export type KeyType =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B'
  | 'Cm'
  | 'C#m'
  | 'Dbm'
  | 'Dm'
  | 'D#m'
  | 'Ebm'
  | 'Em'
  | 'Fm'
  | 'F#m'
  | 'Gbm'
  | 'Gm'
  | 'G#m'
  | 'Abm'
  | 'Am'
  | 'A#m'
  | 'Bbm'
  | 'Bm';
