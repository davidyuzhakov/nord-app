import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getFrontendOrigin } from './auth.config';

@Injectable()
export class AuthRequestGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    http.getResponse<Response>().setHeader('Cache-Control', 'no-store');

    if (request.method !== 'POST') return true;

    let origin = request.get('origin');
    if (origin === undefined) {
      const referer = request.get('referer');
      if (referer) {
        try {
          origin = new URL(referer).origin;
        } catch {
          throw new ForbiddenException('Недопустимый источник запроса');
        }
      }
    }

    if (origin !== getFrontendOrigin()) {
      throw new ForbiddenException('Недопустимый источник запроса');
    }

    return true;
  }
}
