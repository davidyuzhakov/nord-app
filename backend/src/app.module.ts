import { Module } from '@nestjs/common';
import { SongModule } from './song/song.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { AuthModule } from './auth/auth.module';
import { ChurchModule } from './church/church.module';

@Module({
  imports: [SongModule, PrismaModule, ProgramModule, AuthModule, ChurchModule],
})
export class AppModule {}
