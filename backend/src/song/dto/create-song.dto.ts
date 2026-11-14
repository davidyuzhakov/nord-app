import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SongStructureItem {
  @IsString()
  text!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  id!: string;

  @IsString()
  title!: string;
}

export class CreateSongDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @IsIn([
    'C',
    'C#',
    'Db',
    'D',
    'D#',
    'Eb',
    'E',
    'F',
    'F#',
    'Gb',
    'G',
    'G#',
    'Ab',
    'A',
    'A#',
    'Bb',
    'B',
    'Cm',
    'C#m',
    'Dbm',
    'Dm',
    'D#m',
    'Ebm',
    'Em',
    'Fm',
    'F#m',
    'Gbm',
    'Gm',
    'G#m',
    'Abm',
    'Am',
    'A#m',
    'Bbm',
    'Bm',
  ])
  key!: string;

  @IsInt()
  bpm!: number;

  @IsString()
  @MinLength(1)
  text!: string;

  @IsUrl()
  @IsOptional()
  audio?: string;

  @IsUrl()
  @IsOptional()
  danceVideo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SongStructureItem)
  structure?: SongStructureItem[];
}
