import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { randomBytes } from 'node:crypto';
import type { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { JoinChurchDto } from './dto/join-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Injectable()
export class ChurchService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const memberships = await this.prisma.churchMember.findMany({
      where: { userId },
      orderBy: { joinedAt: 'asc' },
      select: { church: true },
    });

    return memberships.map(({ church }) => church);
  }

  create(userId: string, dto: CreateChurchDto) {
    return this.runTransaction(async (tx) => {
      const church = await tx.church.create({
        data: {
          name: dto.name,
          createdById: userId,
          inviteToken: randomBytes(14).toString('base64url'),
          members: { create: { userId } },
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { activeChurchId: church.id },
      });

      return church;
    });
  }

  join(userId: string, dto: JoinChurchDto) {
    return this.runTransaction(async (tx) => {
      const church = await tx.church.findUnique({
        where: { inviteToken: dto.inviteToken },
      });
      if (!church) {
        throw new NotFoundException('Приглашение не найдено');
      }

      await tx.churchMember.upsert({
        where: { userId_churchId: { userId, churchId: church.id } },
        create: { userId, churchId: church.id },
        update: {},
      });
      await tx.user.update({
        where: { id: userId },
        data: { activeChurchId: church.id },
      });

      return church;
    });
  }

  setCurrent(userId: string, churchId: string) {
    return this.runTransaction(async (tx) => {
      await this.ensureExists(tx, userId, churchId);

      return tx.user.update({
        where: { id: userId },
        data: { activeChurchId: churchId },
        select: { activeChurchId: true },
      });
    });
  }

  update(userId: string, churchId: string, dto: UpdateChurchDto) {
    if (dto.name === undefined && dto.refreshInviteToken !== true) {
      throw new BadRequestException(
        'Укажите название или запросите обновление токена приглашения',
      );
    }

    return this.runTransaction(async (tx) => {
      const church = await this.ensureExists(tx, userId, churchId);
      if (church.createdById !== userId) {
        throw new ForbiddenException(
          'Операция доступна только создателю церкви',
        );
      }

      const data: Prisma.ChurchUpdateInput = {};
      if (dto.name !== undefined) data.name = dto.name;
      if (dto.refreshInviteToken) {
        data.inviteToken = randomBytes(14).toString('base64url');
      }

      return tx.church.update({
        where: { id: churchId },
        data,
      });
    });
  }

  remove(userId: string, churchId: string) {
    return this.runTransaction(async (tx) => {
      // Prevent new selections of this church while its current users are moved.
      await tx.$queryRaw`
        SELECT "id" FROM "Church" WHERE "id" = ${churchId}::uuid FOR UPDATE
      `;
      const church = await this.ensureExists(tx, userId, churchId);
      if (church.createdById !== userId) {
        throw new ForbiddenException(
          'Операция доступна только создателю церкви',
        );
      }

      const currentUsers = await tx.user.findMany({
        where: { activeChurchId: churchId },
        select: {
          id: true,
          churchMemberships: {
            where: { churchId: { not: churchId } },
            orderBy: { joinedAt: 'asc' },
            take: 1,
            select: { churchId: true },
          },
        },
      });

      for (const user of currentUsers) {
        await tx.user.updateMany({
          where: { id: user.id, activeChurchId: churchId },
          data: { activeChurchId: user.churchMemberships[0]?.churchId ?? null },
        });
      }

      await tx.church.delete({ where: { id: churchId } });

      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { activeChurchId: true },
      });
    });
  }

  private async ensureExists(
    tx: Prisma.TransactionClient,
    userId: string,
    churchId: string,
  ) {
    const church = await tx.church.findFirst({
      where: { id: churchId, members: { some: { userId } } },
    });
    if (!church) {
      throw new NotFoundException('Церковь не найдена');
    }

    return church;
  }

  private async runTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(operation);
    } catch (error) {
      if (!(error instanceof PrismaClientKnownRequestError)) throw error;

      const code = error.code === 'P2010' ? error.meta?.code : error.code;

      switch (code) {
        case 'P2002':
        case 'P2003':
        case 'P2014':
        case 'P2025':
        case 'P2034':
        case '40001':
        case '40P01':
          throw new ConflictException(
            'Не удалось выполнить операцию из-за конфликта данных',
          );
        default:
          throw error;
      }
    }
  }
}
