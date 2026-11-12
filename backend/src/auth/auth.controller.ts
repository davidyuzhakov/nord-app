import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthRequestGuard } from './auth-request.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest, AuthUser } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  clearSessionCookie,
  getSessionToken,
  setSessionCookie,
} from './session-cookie';
import { SessionGuard } from './session.guard';

@Controller('auth')
@UseGuards(AuthRequestGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthUser> {
    const { user, token, expiresAt } = await this.authService.register(
      dto,
      getSessionToken(request),
    );
    setSessionCookie(response, token, expiresAt);
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthUser> {
    const { user, token, expiresAt } = await this.authService.login(
      dto,
      getSessionToken(request),
    );
    setSessionCookie(response, token, expiresAt);
    return user;
  }

  @Get('me')
  @UseGuards(SessionGuard)
  async me(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthUser> {
    const { token, session } = request.auth;
    const expiresAt = await this.authService.renewSession(session);
    if (!expiresAt) {
      clearSessionCookie(response);
      throw new UnauthorizedException('Сессия недействительна');
    }

    setSessionCookie(response, token, expiresAt);
    return session.user;
  }

  @Patch('me')
  @UseGuards(SessionGuard)
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ): Promise<AuthUser> {
    return this.authService.updateUser(request.auth.session.userId, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(getSessionToken(request));
    clearSessionCookie(response);
  }
}
