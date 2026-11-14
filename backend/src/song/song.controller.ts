import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthRequestGuard } from '@/auth/auth-request.guard';
import { SessionGuard } from '@/auth/session.guard';
import type { AuthenticatedRequest } from '@/auth/auth.types';
import { ActiveChurchGuard } from '@/church/active-church.guard';
import type { ActiveChurchRequest } from '@/church/church.types';
import { SongService } from './song.service';
import { GetSongsDto } from './dto/get-songs.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Controller('song')
@UseGuards(AuthRequestGuard, SessionGuard)
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Get()
  @UseGuards(ActiveChurchGuard)
  getAllSongs(@Req() request: ActiveChurchRequest, @Query() dto: GetSongsDto) {
    return this.songService.findAll(request.churchId, dto);
  }

  @Get(':id')
  @UseGuards(ActiveChurchGuard)
  findOne(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.songService.findOne(request.churchId, id);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSongDto,
  ) {
    return this.songService.update(id, dto, request.auth.session.user);
  }

  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.songService.remove(id, request.auth.session.user);
  }
}
