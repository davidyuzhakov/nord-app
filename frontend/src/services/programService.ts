import { apiInstance } from '@/api';
import type { Program, ProgramSong } from '@/models/Program';

export type CreateProgramDto = {
  name: string;
  songsId: number[];
  date: string;
};
export type UpdateProgramDto = {
  name?: string;
  songsId?: number[];
  date?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
};
export type UpdateProgramSongDto = Partial<
  Omit<ProgramSong, 'id' | 'programId' | 'songId' | 'song'>
>;

const requestConfig = { timeout: 15000 };

export const programService = {
  getAllPrograms: async (signal?: AbortSignal) => {
    const { data } = await apiInstance.get<Program[]>('/program', {
      ...requestConfig,
      signal,
    });
    return data;
  },
  getProgram: async (id: number, signal?: AbortSignal) => {
    const { data } = await apiInstance.get<Program>(`/program/${id}`, {
      ...requestConfig,
      signal,
    });
    return data;
  },

  getProgramSong: async (
    programId: number,
    songId: number,
    signal?: AbortSignal,
  ) => {
    const { data } = await apiInstance.get<ProgramSong>(
      `/program/${programId}/songs/${songId}`,
      { ...requestConfig, signal },
    );
    return data;
  },

  createProgram: async (payload: CreateProgramDto) => {
    const { data } = await apiInstance.post<Program>(
      '/program',
      payload,
      requestConfig,
    );
    return data;
  },

  updateProgram: async (id: number, payload: UpdateProgramDto) => {
    const { data } = await apiInstance.patch<Program>(
      `/program/${id}`,
      payload,
      requestConfig,
    );
    return data;
  },

  updateProgramSong: async (
    programId: number,
    songId: number,
    payload: UpdateProgramSongDto,
  ) => {
    const { data } = await apiInstance.patch<ProgramSong>(
      `/program/${programId}/songs/${songId}`,
      payload,
      requestConfig,
    );
    return data;
  },

  deleteProgram: async (id: number) => {
    const { data } = await apiInstance.delete<void>(
      `/program/${id}`,
      requestConfig,
    );
    return data;
  },
};
