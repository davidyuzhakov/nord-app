import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Введите корректный email' })
  email!: string;

  @IsString()
  @Length(8, 128, {
    message: 'Пароль должен содержать от 8 до 128 символов',
  })
  password!: string;
}
