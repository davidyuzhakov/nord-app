import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { ChurchModule } from '@/church/church.module';

@Module({
  controllers: [ProgramController],
  imports: [PrismaModule, AuthModule, ChurchModule],
  providers: [ProgramService],
})
export class ProgramModule {}
