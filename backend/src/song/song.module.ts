import { Module } from '@nestjs/common';
import { SongService } from './song.service';
import { SongController } from './song.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { ChurchModule } from '@/church/church.module';
import { ChurchSongController } from './church-song.controller';
import { ChurchSongService } from './church-song.service';

@Module({
  imports: [PrismaModule, AuthModule, ChurchModule],
  controllers: [SongController, ChurchSongController],
  providers: [SongService, ChurchSongService],
})
export class SongModule {}
