const DAY_MS = 24 * 60 * 60 * 1000;

export const SESSION_IDLE_TIMEOUT_MS = 30 * DAY_MS;
export const SESSION_ABSOLUTE_TIMEOUT_MS = 365 * DAY_MS;

export function getFrontendOrigin(): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://nord-app.ru'
    : 'http://localhost:5174';
}
