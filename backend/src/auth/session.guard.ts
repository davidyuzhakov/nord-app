import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';
import { clearSessionCookie, getSessionToken } from './session-cookie';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const token = getSessionToken(request);
    const session = token ? await this.authService.findSession(token) : null;

    if (!token || !session) {
      clearSessionCookie(http.getResponse<Response>());
      throw new UnauthorizedException('Сессия недействительна');
    }

    request.auth = { token, session };
    return true;
  }
}
