import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { AuthUser } from '@/auth/auth.types';
import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { GetSongsDto } from './dto/get-songs.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class ChurchSongService {
  private readonly logger = new Logger(ChurchSongService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(churchId: string, { search }: GetSongsDto) {
    if (!search) {
      return this.prisma.churchSong.findMany({
        where: { churchId },
        orderBy: { name: 'asc' },
      });
    }

    const nameFilter = { contains: search, mode: 'insensitive' as const };
    const [songsByName, songsByText] = await Promise.all([
      this.prisma.churchSong.findMany({
        where: { churchId, name: nameFilter },
        orderBy: { name: 'asc' },
      }),
      this.prisma.churchSong.findMany({
        where: { churchId, text: nameFilter, NOT: { name: nameFilter } },
        orderBy: { name: 'asc' },
      }),
    ]);
    return [...songsByName, ...songsByText];
  }

  async findOne(churchId: string, id: number) {
    const song = await this.prisma.churchSong.findUnique({
      where: { id, churchId },
    });
    if (!song) throw new NotFoundException('Песня не найдена');
    return song;
  }

  async create(churchId: string, dto: CreateSongDto, user: AuthUser) {
    const song = await this.prisma.churchSong
      .create({
        data: {
          churchId,
          ...dto,
          structure:
            dto.structure === null
              ? Prisma.DbNull
              : dto.structure?.map((item) => ({ ...item })),
        },
      })
      .catch((error: unknown) => this.handleError(error));
    this.logger.log({
      message: 'Песня церкви создана',
      churchId,
      songId: song.id,
      user: { id: user.id, name: user.fullName },
    });
    return song;
  }

  async addFromCatalog(churchId: string, sourceSongId: number, user: AuthUser) {
    const source = await this.prisma.song.findUnique({
      where: { id: sourceSongId },
    });
    if (!source)
      throw new NotFoundException('Песня общего каталога не найдена');

    const added = await this.prisma.churchSong
      .createMany({
        data: {
          churchId,
          sourceSongId,
          name: source.name,
          key: source.key,
          bpm: source.bpm,
          text: source.text,
          audio: source.audio,
          danceVideo: source.danceVideo,
          structure: source.structure ?? Prisma.DbNull,
        },
        skipDuplicates: true,
      })
      .catch((error: unknown) => this.handleError(error));
    const song = await this.prisma.churchSong.findUnique({
      where: { churchId_sourceSongId: { churchId, sourceSongId } },
    });
    if (!song)
      throw new ConflictException('Данные изменились. Повторите операцию');

    if (added.count > 0) {
      this.logger.log({
        message: 'Песня добавлена из общего каталога',
        churchId,
        songId: song.id,
        sourceSongId,
        user: { id: user.id, name: user.fullName },
      });
    }
    return song;
  }

  async update(
    churchId: string,
    id: number,
    dto: UpdateSongDto,
    user: AuthUser,
  ) {
    const song = await this.prisma.churchSong
      .update({
        where: { id, churchId },
        data: {
          ...dto,
          structure:
            dto.structure === null
              ? Prisma.DbNull
              : dto.structure?.map((item) => ({ ...item })),
        },
      })
      .catch((error: unknown) => this.handleError(error));
    this.logger.log({
      message: 'Песня церкви изменена',
      churchId,
      songId: song.id,
      user: { id: user.id, name: user.fullName },
    });
    return song;
  }

  async remove(churchId: string, id: number, user: AuthUser) {
    const song = await this.prisma.churchSong
      .delete({
        where: { id, churchId },
      })
      .catch((error: unknown) => this.handleError(error));
    this.logger.log({
      message: 'Песня церкви удалена',
      churchId,
      songId: song.id,
      user: { id: user.id, name: user.fullName },
    });
    return song;
  }

  private handleError(error: unknown): never {
    if (!(error instanceof PrismaClientKnownRequestError)) throw error;
    if (error.code === 'P2025') throw new NotFoundException('Песня не найдена');
    if (error.code === 'P2003' || error.code === 'P2034') {
      throw new ConflictException('Данные изменились. Повторите операцию');
    }
    throw error;
  }
}
