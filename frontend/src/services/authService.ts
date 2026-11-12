import { apiInstance } from '@/api';
import type { User } from '@/models/User';
import { isAxiosError } from 'axios';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  fullName: string;
}

export interface UpdateUserDto {
  fullName: string;
}

const requestConfig = { timeout: 15000 };

async function getCurrentUser() {
  const { data } = await apiInstance.get<User>('/auth/me', requestConfig);
  return data;
}

async function authenticate(
  path: '/auth/login' | '/auth/register',
  payload: LoginDto | RegisterDto,
) {
  try {
    const { data } = await apiInstance.post<User>(path, payload, requestConfig);
    return data;
  } catch (error) {
    if (
      isAxiosError<{ message?: unknown }>(error) &&
      error.response?.status === 409 &&
      error.response.data?.message === 'Вы уже авторизованы'
    ) {
      return getCurrentUser();
    }
    throw error;
  }
}

export const authService = {
  me: getCurrentUser,
  updateMe: async ({ fullName }: UpdateUserDto) => {
    const { data } = await apiInstance.patch<User>(
      '/auth/me',
      { fullName },
      requestConfig,
    );
    return data;
  },
  login: (payload: LoginDto) => authenticate('/auth/login', payload),
  register: (payload: RegisterDto) => authenticate('/auth/register', payload),
  logout: async () => {
    await apiInstance.post<void>('/auth/logout', undefined, requestConfig);
  },
};
