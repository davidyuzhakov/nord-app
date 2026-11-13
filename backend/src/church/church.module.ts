import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ChurchController],
  providers: [ChurchService],
})
export class ChurchModule {}
