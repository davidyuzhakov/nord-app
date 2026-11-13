import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthRequestGuard } from './auth-request.guard';
import { AuthService } from './auth.service';
import { SessionGuard } from './session.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRequestGuard, SessionGuard],
  exports: [AuthService, AuthRequestGuard, SessionGuard],
})
export class AuthModule {}
