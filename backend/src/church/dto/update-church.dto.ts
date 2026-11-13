import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, ValidateIf } from 'class-validator';
import { CreateChurchDto } from './create-church.dto';

export class UpdateChurchDto extends PartialType(CreateChurchDto, {
  skipNullProperties: false,
}) {
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  refreshInviteToken?: boolean;
}
