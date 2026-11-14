import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthRequestGuard } from '@/auth/auth-request.guard';
import { SessionGuard } from '@/auth/session.guard';
import { ActiveChurchGuard } from '@/church/active-church.guard';
import type { ActiveChurchRequest } from '@/church/church.types';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { UpdateProgramSongDto } from './dto/update-program-song.dto';

@Controller('program')
@UseGuards(AuthRequestGuard, SessionGuard, ActiveChurchGuard)
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  create(
    @Req() request: ActiveChurchRequest,
    @Body() createProgramDto: CreateProgramDto,
  ) {
    return this.programService.create(
      request.churchId,
      createProgramDto,
      request.auth.session.user,
    );
  }

  @Get()
  findAll(@Req() request: ActiveChurchRequest) {
    return this.programService.findAll(request.churchId);
  }

  @Get(':id')
  findOne(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.programService.findOne(request.churchId, id);
  }

  @Get(':id/songs/:songId')
  findProgramSong(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    return this.programService.findProgramSong(request.churchId, id, songId);
  }

  @Patch(':id')
  update(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programService.update(
      request.churchId,
      id,
      updateProgramDto,
      request.auth.session.user,
    );
  }

  @Patch(':id/songs/:songId')
  updateProgramSong(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
    @Param('songId', ParseIntPipe) songId: number,
    @Body() dto: UpdateProgramSongDto,
  ) {
    return this.programService.updateProgramSong(
      request.churchId,
      id,
      songId,
      dto,
      request.auth.session.user,
    );
  }

  @Delete(':id')
  remove(
    @Req() request: ActiveChurchRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.programService.remove(
      request.churchId,
      id,
      request.auth.session.user,
    );
  }
}
