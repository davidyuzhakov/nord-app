import { Module } from '@nestjs/common';
import { SongModule } from './song/song.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgramModule } from './program/program.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [SongModule, PrismaModule, ProgramModule, AuthModule],
})
export class AppModule {}
