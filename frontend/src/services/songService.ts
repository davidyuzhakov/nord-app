import { apiInstance } from '@/api';
import type { ChurchSong, LibrarySong, Song, SongCatalog } from '@/models/Song';

export type CreateSongDto = Pick<
  Song,
  'name' | 'key' | 'bpm' | 'text' | 'structure' | 'danceVideo' | 'audio'
>;
export type UpdateSongDto = Partial<CreateSongDto>;
export interface GetSongsParams {
  catalog: SongCatalog;
  search?: string;
}
export interface SongReference {
  catalog: SongCatalog;
  id: number;
}

const requestConfig = { timeout: 15000 };
const getPath = (catalog: SongCatalog) =>
  catalog === 'general' ? '/song' : '/church-song';

export const songService = {
  getAllSongs: async (
    { catalog, search }: GetSongsParams,
    signal?: AbortSignal,
  ) => {
    const { data } = await apiInstance.get<LibrarySong[]>(getPath(catalog), {
      ...requestConfig,
      params: { search },
      signal,
    });
    return data;
  },
  getSong: async ({ catalog, id }: SongReference, signal?: AbortSignal) => {
    const { data } = await apiInstance.get<LibrarySong>(
      `${getPath(catalog)}/${id}`,
      {
        ...requestConfig,
        signal,
      },
    );
    return data;
  },
  createSong: async (catalog: SongCatalog, payload: CreateSongDto) => {
    const { data } = await apiInstance.post<LibrarySong>(
      getPath(catalog),
      payload,
      requestConfig,
    );
    return data;
  },
  addFromCatalog: async (songId: number) => {
    const { data } = await apiInstance.post<ChurchSong>(
      `/church-song/from-catalog/${songId}`,
      undefined,
      requestConfig,
    );
    return data;
  },
  updateSong: async (
    { catalog, id }: SongReference,
    payload: UpdateSongDto,
  ) => {
    const { data } = await apiInstance.patch<LibrarySong>(
      `${getPath(catalog)}/${id}`,
      payload,
      requestConfig,
    );
    return data;
  },
  deleteSong: async ({ catalog, id }: SongReference) => {
    await apiInstance.delete(`${getPath(catalog)}/${id}`, requestConfig);
  },
};
