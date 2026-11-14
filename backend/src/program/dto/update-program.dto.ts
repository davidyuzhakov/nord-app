import {
  IsString,
  ArrayUnique,
  IsArray,
  IsInt,
  IsBoolean,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class UpdateProgramDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  songsId?: number[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
