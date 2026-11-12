import { PickType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';

export class UpdateUserDto extends PickType(RegisterDto, [
  'fullName',
] as const) {}
