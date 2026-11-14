import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';
import { ActiveChurchGuard } from './active-church.guard';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ChurchController],
  providers: [ChurchService, ActiveChurchGuard],
  exports: [ActiveChurchGuard],
})
export class ChurchModule {}
