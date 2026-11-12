import type { CookieOptions, Request, Response } from 'express';

const SESSION_COOKIE_NAME = 'nord_session';

function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

export function getSessionToken(request: Request): string | undefined {
  const token: unknown = request.cookies?.[SESSION_COOKIE_NAME];
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)
    ? token
    : undefined;
}

export function setSessionCookie(
  response: Response,
  token: string,
  expiresAt: Date,
): void {
  response.cookie(SESSION_COOKIE_NAME, token, {
    ...getCookieOptions(),
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE_NAME, getCookieOptions());
}
