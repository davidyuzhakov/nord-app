import { Matches } from 'class-validator';

export class JoinChurchDto {
  @Matches(/^[A-Za-z0-9_-]{19}$/, {
    message: 'Некорректный токен приглашения',
  })
  inviteToken!: string;
}
