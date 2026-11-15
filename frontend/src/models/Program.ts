import type { ChurchSong, KeyType } from './Song';

export interface ProgramSong {
  id: number;
  order: number;
  song: ChurchSong;
  songId: number;
  programId: number;
  key: KeyType | null;
}

export interface Program {
  id: number;
  name: string;
  songs: ProgramSong[];
  isArchived: boolean;
  isFavorite: boolean;
  updatedAt: string;
  date?: string;
}
