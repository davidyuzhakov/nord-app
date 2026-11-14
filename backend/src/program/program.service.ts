import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { AuthUser } from '@/auth/auth.types';
import type { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { UpdateProgramSongDto } from './dto/update-program-song.dto';

@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly programInclude = {
    songs: {
      include: { song: true },
      orderBy: { order: 'asc' as const },
    },
  };

  async create(churchId: string, dto: CreateProgramDto, user: AuthUser) {
    const program = await this.prisma.program
      .create({
        data: {
          church: { connect: { id: churchId } },
          name: dto.name,
          date: new Date(dto.date),
          songs: {
            create: dto.songsId.map((songId, index) => ({
              song: { connect: { id: songId, churchId } },
              order: index + 1,
            })),
          },
        },
        include: this.programInclude,
      })
      .catch((error: unknown) => this.handleError(error));

    this.logger.log({
      message: 'Программа создана',
      churchId,
      programId: program.id,
      user: { id: user.id, name: user.fullName },
    });
    return program;
  }

  findAll(churchId: string) {
    return this.prisma.program.findMany({
      where: { churchId },
      orderBy: { createdAt: 'desc' },
      include: this.programInclude,
    });
  }

  async findOne(churchId: string, id: number) {
    const program = await this.prisma.program.findUnique({
      where: { id, churchId },
      include: this.programInclude,
    });
    if (!program) throw new NotFoundException('Программа не найдена');
    return program;
  }

  async update(
    churchId: string,
    id: number,
    dto: UpdateProgramDto,
    user: AuthUser,
  ) {
    const updatedProgram = await this.prisma
      .$transaction(
        async (tx) => {
          const program = await tx.program.findUnique({
            where: { id, churchId },
            include: { songs: true },
          });
          if (!program) throw new NotFoundException('Программа не найдена');
          const data: Prisma.ProgramUpdateInput = {
            name: dto.name ?? undefined,
            date: dto.date ?? undefined,
            isArchived: dto.isArchived ?? undefined,
            isFavorite: dto.isFavorite ?? undefined,
          };

          if (dto.songsId != null) {
            data.songs = {
              deleteMany: {},
              create: dto.songsId.map((songId, index) => ({
                song: { connect: { id: songId, churchId } },
                order: index + 1,
                key: program.songs.find((song) => song.songId === songId)?.key,
              })),
            };
          }

          return tx.program.update({
            where: { id, churchId },
            data,
            include: this.programInclude,
          });
        },
        { isolationLevel: 'Serializable' },
      )
      .catch((error: unknown) => this.handleError(error));

    this.logger.log({
      message: 'Программа изменена',
      churchId,
      programId: id,
      user: { id: user.id, name: user.fullName },
    });
    return updatedProgram;
  }

  async findProgramSong(churchId: string, programId: number, songId: number) {
    const programSong = await this.prisma.programSong.findUnique({
      where: {
        programId_songId: { programId, songId },
        program: { churchId },
      },
      include: { song: true },
    });
    if (!programSong)
      throw new NotFoundException('Песня не найдена в программе');
    return programSong;
  }

  async updateProgramSong(
    churchId: string,
    programId: number,
    songId: number,
    dto: UpdateProgramSongDto,
    user: AuthUser,
  ) {
    const programSong = await this.prisma.programSong
      .update({
        where: {
          programId_songId: { programId, songId },
          program: { churchId },
        },
        data: { key: dto.key, order: dto.order ?? undefined },
        include: { song: true },
      })
      .catch((error: unknown) => this.handleError(error));

    this.logger.log({
      message: 'Песня в программе изменена',
      churchId,
      programId,
      songId,
      user: { id: user.id, name: user.fullName },
    });
    return programSong;
  }

  async remove(churchId: string, id: number, user: AuthUser) {
    const program = await this.prisma.program
      .delete({
        where: { id, churchId },
      })
      .catch((error: unknown) => this.handleError(error));
    this.logger.log({
      message: 'Программа удалена',
      churchId,
      programId: id,
      user: { id: user.id, name: user.fullName },
    });
    return program;
  }

  private handleError(error: unknown): never {
    if (!(error instanceof PrismaClientKnownRequestError)) throw error;
    if (error.code === 'P2002') {
      throw new BadRequestException('Такая песня уже есть в программе');
    }
    if (error.code === 'P2025') {
      throw new NotFoundException(
        'Программа или песня не найдена в выбранной церкви',
      );
    }
    if (error.code === 'P2003' || error.code === 'P2034') {
      throw new ConflictException('Данные изменились. Повторите операцию');
    }
    throw error;
  }
}
