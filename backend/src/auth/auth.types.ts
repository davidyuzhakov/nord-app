import type { Request } from 'express';
import type { Session, User } from '@/generated/prisma/client';

export type AuthUser = Pick<
  User,
  'id' | 'email' | 'fullName' | 'activeChurchId'
>;

export type AuthSession = Session & { user: AuthUser };

export interface AuthenticatedRequest extends Request {
  auth: {
    token: string;
    session: AuthSession;
  };
}
