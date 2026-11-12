import { isAxiosError } from 'axios';

export interface AuthError {
  status: number | null;
  messages: string[];
}

export function getAuthError(error: unknown): AuthError {
  if (!isAxiosError<{ message?: unknown }>(error)) {
    return {
      status: null,
      messages: ['Не удалось выполнить запрос. Попробуйте ещё раз.'],
    };
  }

  if (!error.response) {
    return {
      status: null,
      messages: [
        error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
          ? 'Сервер не ответил вовремя. Попробуйте ещё раз.'
          : 'Не удалось связаться с сервером. Попробуйте ещё раз.',
      ],
    };
  }

  const { status, data } = error.response;
  if (status >= 500) {
    return {
      status,
      messages: ['На сервере произошла ошибка. Попробуйте позже.'],
    };
  }

  const message = data?.message;
  const messages = (Array.isArray(message) ? message : [message]).filter(
    (value): value is string =>
      typeof value === 'string' && value.trim().length > 0,
  );

  return {
    status,
    messages:
      messages.length > 0
        ? [...new Set(messages)]
        : ['Не удалось выполнить запрос. Попробуйте ещё раз.'],
  };
}
