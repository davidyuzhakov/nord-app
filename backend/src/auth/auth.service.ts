import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '@/prisma/prisma.service';
import type { Prisma } from '@/generated/prisma/client';
import {
  SESSION_ABSOLUTE_TIMEOUT_MS,
  SESSION_IDLE_TIMEOUT_MS,
} from './auth.config';
import type { AuthSession } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const userSelect = { id: true, email: true, fullName: true } as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto, currentToken?: string) {
    if (currentToken && (await this.findSession(currentToken))) {
      throw new ConflictException('Вы уже авторизованы');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: dto.email, fullName: dto.fullName, passwordHash },
          select: userSelect,
        });
        const session = await this.createSession(tx, user.id);
        return { user, ...session };
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Этот email уже зарегистрирован');
      }
      throw error;
    }
  }

  async login(dto: LoginDto, currentToken?: string) {
    if (currentToken && (await this.findSession(currentToken))) {
      throw new ConflictException('Вы уже авторизованы');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { ...userSelect, passwordHash: true },
    });

    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const session = await this.createSession(this.prisma, user.id);
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName },
      ...session,
    };
  }

  async logout(token?: string): Promise<void> {
    if (!token) return;
    await this.prisma.session.deleteMany({
      where: { tokenHash: this.hashToken(token) },
    });
  }

  async findSession(token: string): Promise<AuthSession | null> {
    const tokenHash = this.hashToken(token);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: { select: userSelect } },
    });
    if (!session) return null;

    const now = new Date();
    const absoluteCutoff = new Date(
      now.getTime() - SESSION_ABSOLUTE_TIMEOUT_MS,
    );
    if (session.expiresAt <= now || session.createdAt <= absoluteCutoff) {
      await this.deleteExpiredSession(tokenHash, now);
      return null;
    }

    return session;
  }

  async renewSession(session: AuthSession): Promise<Date | null> {
    const now = new Date();
    const absoluteCutoff = new Date(
      now.getTime() - SESSION_ABSOLUTE_TIMEOUT_MS,
    );
    const expiresAt = new Date(
      Math.min(
        now.getTime() + SESSION_IDLE_TIMEOUT_MS,
        session.createdAt.getTime() + SESSION_ABSOLUTE_TIMEOUT_MS,
      ),
    );

    try {
      const renewed = await this.prisma.session.update({
        where: {
          tokenHash: session.tokenHash,
          expiresAt: { gt: now, lte: expiresAt },
          createdAt: { gt: absoluteCutoff },
        },
        data: { expiresAt },
        select: { expiresAt: true },
      });
      return renewed.expiresAt;
    } catch (error) {
      if (
        !(error instanceof PrismaClientKnownRequestError) ||
        error.code !== 'P2025'
      ) {
        throw error;
      }
    }

    const current = await this.prisma.session.findUnique({
      where: {
        tokenHash: session.tokenHash,
        expiresAt: { gt: now, gte: expiresAt },
        createdAt: { gt: absoluteCutoff },
      },
      select: { expiresAt: true },
    });
    if (current) return current.expiresAt;

    await this.deleteExpiredSession(session.tokenHash, now);
    return null;
  }

  private async deleteExpiredSession(tokenHash: string, now: Date) {
    await this.prisma.session.deleteMany({
      where: {
        tokenHash,
        OR: [
          { expiresAt: { lte: now } },
          {
            createdAt: {
              lte: new Date(now.getTime() - SESSION_ABSOLUTE_TIMEOUT_MS),
            },
          },
        ],
      },
    });
  }

  private async createSession(tx: Prisma.TransactionClient, userId: string) {
    const token = randomBytes(32).toString('base64url');
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + SESSION_IDLE_TIMEOUT_MS);
    await tx.session.create({
      data: { tokenHash: this.hashToken(token), userId, createdAt, expiresAt },
    });

    return { token, expiresAt };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
