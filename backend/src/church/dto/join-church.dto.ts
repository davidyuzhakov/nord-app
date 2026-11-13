import { IsString, Length, Matches } from 'class-validator';

export class JoinChurchDto {
  @IsString()
  @Length(19, 19)
  @Matches(/^[A-Za-z0-9_-]{19}$/, {
    message: 'Некорректный токен приглашения',
  })
  inviteToken!: string;
}
