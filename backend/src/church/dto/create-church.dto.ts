import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CreateChurchDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 30, {
    message: 'Название должно содержать от 1 до 30 символов',
  })
  name!: string;
}
