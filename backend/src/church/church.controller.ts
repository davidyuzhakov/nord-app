import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthRequestGuard } from '@/auth/auth-request.guard';
import type { AuthenticatedRequest } from '@/auth/auth.types';
import { SessionGuard } from '@/auth/session.guard';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { JoinChurchDto } from './dto/join-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Controller('church')
@UseGuards(AuthRequestGuard, SessionGuard)
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.churchService.findAll(request.auth.session.userId);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateChurchDto) {
    return this.churchService.create(request.auth.session.userId, dto);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  join(@Req() request: AuthenticatedRequest, @Body() dto: JoinChurchDto) {
    return this.churchService.join(request.auth.session.userId, dto);
  }

  @Patch('current')
  setCurrent(
    @Req() request: AuthenticatedRequest,
    @Body('churchId', new ParseUUIDPipe()) churchId: string,
  ) {
    return this.churchService.setCurrent(request.auth.session.userId, churchId);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateChurchDto,
  ) {
    return this.churchService.update(request.auth.session.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.churchService.remove(request.auth.session.userId, id);
  }
}
