import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { ActiveChurchRequest } from './church.types';

@Injectable()
export class ActiveChurchGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ActiveChurchRequest>();
    const churchId = request.auth.session.user.activeChurchId;
    if (!churchId) {
      throw new ForbiddenException('Сначала выберите церковь');
    }

    const membership = await this.prisma.churchMember.findUnique({
      where: {
        userId_churchId: { userId: request.auth.session.userId, churchId },
      },
      select: { churchId: true },
    });
    if (!membership) {
      throw new ForbiddenException('Нет доступа к выбранной церкви');
    }

    request.churchId = churchId;
    return true;
  }
}
