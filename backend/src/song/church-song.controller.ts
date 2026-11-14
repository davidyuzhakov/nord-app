import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthRequestGuard } from '@/auth/auth-request.guard';
import { SessionGuard } from '@/auth/session.guard';
import { ActiveChurchGuard } from '@/church/active-church.guard';
import type { ActiveChurchRequest } from '@/church/church.types';
import { ChurchSongService } from './church-song.service';
import { CreateSongDto } from './dto/create-song.dto';
import { GetSongsDto } from './dto/get-songs.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Controller('church-song')
@UseGuards(AuthRequestGuard, SessionGuard, ActiveChurchGuard)
export class ChurchSongController {
  constructor(private readonly churchSongService: ChurchSongService) {}

  @Get()
  findAll(@Req() request: ActiveChurchRequest, @Query() dto: GetSongsDto) {
    return this.churchSongService.findAll(request.churchId, dto);
  }

  @Get(':id')
  findOne(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.churchSongService.findOne(request.churchId, id);
  }

  @Post()
  create(@Req() request: ActiveChurchRequest, @Body() dto: CreateSongDto) {
    return this.churchSongService.create(
      request.churchId,
      dto,
      request.auth.session.user,
    );
  }

  @Post('from-catalog/:songId')
  addFromCatalog(
    @Req() request: ActiveChurchRequest,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    return this.churchSongService.addFromCatalog(
      request.churchId,
      songId,
      request.auth.session.user,
    );
  }

  @Patch(':id')
  update(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSongDto,
  ) {
    return this.churchSongService.update(
      request.churchId,
      id,
      dto,
      request.auth.session.user,
    );
  }

  @Delete(':id')
  remove(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.churchSongService.remove(
      request.churchId,
      id,
      request.auth.session.user,
    );
  }
}
