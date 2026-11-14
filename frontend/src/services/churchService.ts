import { apiInstance } from '@/api';
import type { Church, ChurchInvite } from '@/models/Church';

export interface CreateChurchDto {
  name: string;
}

export interface UpdateChurchDto {
  name?: string;
  refreshInviteToken?: boolean;
}

const requestConfig = { timeout: 15000 };

export const churchService = {
  getAllChurches: async () => {
    const { data } = await apiInstance.get<Church[]>('/church', requestConfig);
    return data;
  },
  getChurchInvite: async (inviteToken: string, signal?: AbortSignal) => {
    const { data } = await apiInstance.get<ChurchInvite>(
      `/church/invite/${encodeURIComponent(inviteToken)}`,
      { ...requestConfig, signal },
    );
    return data;
  },
  createChurch: async (payload: CreateChurchDto) => {
    const { data } = await apiInstance.post<Church>(
      '/church',
      payload,
      requestConfig,
    );
    return data;
  },
  joinChurch: async (inviteToken: string) => {
    const { data } = await apiInstance.post<Church>(
      '/church/join',
      { inviteToken },
      requestConfig,
    );
    return data;
  },
  setCurrentChurch: async (churchId: string) => {
    const { data } = await apiInstance.patch<{ activeChurchId: string }>(
      '/church/current',
      { churchId },
      requestConfig,
    );
    return data;
  },
  updateChurch: async (churchId: string, payload: UpdateChurchDto) => {
    const { data } = await apiInstance.patch<Church>(
      `/church/${churchId}`,
      payload,
      requestConfig,
    );
    return data;
  },
  deleteChurch: async (churchId: string) => {
    const { data } = await apiInstance.delete<{
      activeChurchId: string | null;
    }>(`/church/${churchId}`, requestConfig);
    return data;
  },
};
