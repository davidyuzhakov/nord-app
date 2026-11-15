import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { AuthUser } from '@/auth/auth.types';
import { Prisma } from '@/generated/prisma/client';
import type { Song } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSongDto } from './dto/create-song.dto';
import { GetSongsDto } from './dto/get-songs.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongService {
  private readonly logger = new Logger(SongService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSongDto, user: AuthUser) {
    this.ensureOwner(user);
    const song = await this.prisma.song.create({
      data: { ...dto, structure: dto.structure ?? Prisma.DbNull },
    });
    this.logger.log({
      message: 'Песня общего каталога создана',
      songId: song.id,
      user: { id: user.id, name: user.fullName },
    });
    return song;
  }

  async findAll(churchId: string, { search }: GetSongsDto) {
    const include = this.catalogInclude(churchId);
    if (!search) {
      const songs = await this.prisma.song.findMany({
        orderBy: { name: 'asc' },
        include,
      });
      return songs.map((song) => this.withChurchSongId(song));
    }

    const nameFilter = { contains: search, mode: 'insensitive' as const };
    const [songsByName, songsByText] = await Promise.all([
      this.prisma.song.findMany({
        where: { name: nameFilter },
        orderBy: { name: 'asc' },
        include,
      }),
      this.prisma.song.findMany({
        where: { text: nameFilter, NOT: { name: nameFilter } },
        orderBy: { name: 'asc' },
        include,
      }),
    ]);

    return [...songsByName, ...songsByText].map((song) =>
      this.withChurchSongId(song),
    );
  }

  async findOne(churchId: string, id: number) {
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: this.catalogInclude(churchId),
    });
    if (!song) throw new NotFoundException('Песня не найдена');
    return this.withChurchSongId(song);
  }

  async update(id: number, dto: UpdateSongDto, user: AuthUser) {
    this.ensureOwner(user);
    const song = await this.prisma.song
      .update({
        where: { id },
        data: {
          ...dto,
          structure: dto.structure === null ? Prisma.DbNull : dto.structure,
        },
      })
      .catch((error: unknown) => this.handleError(error));
    this.logger.log({
      message: 'Песня общего каталога изменена',
      songId: song.id,
      user: { id: user.id, name: user.fullName },
    });
    return song;
  }

  async remove(id: number, user: AuthUser) {
    this.ensureOwner(user);
    const song = await this.prisma.song
      .delete({ where: { id } })
      .catch((error: unknown) => this.handleError(error));
    this.logger.log({
      message: 'Песня общего каталога удалена',
      songId: song.id,
      user: { id: user.id, name: user.fullName },
    });
    return song;
  }

  private handleError(error: unknown): never {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Песня не найдена');
    }
    throw error;
  }

  private ensureOwner(user: AuthUser) {
    if (user.email !== 'davidyuzhakov17@gmail.com') {
      throw new ForbiddenException('Нет доступа');
    }
  }

  private catalogInclude(churchId: string) {
    return {
      churchSongs: { where: { churchId }, select: { id: true } },
    };
  }

  private withChurchSongId({
    churchSongs,
    ...song
  }: Song & { churchSongs: { id: number }[] }) {
    return { ...song, churchSongId: churchSongs[0]?.id ?? null };
  }
}
