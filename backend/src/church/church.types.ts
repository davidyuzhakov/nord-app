import type { AuthenticatedRequest } from '@/auth/auth.types';

export interface ActiveChurchRequest extends AuthenticatedRequest {
  churchId: string;
}
