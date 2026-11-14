export interface Church {
  id: string;
  name: string;
  createdById: string;
  inviteToken: string;
  createdAt: string;
  updatedAt: string;
}

export type ChurchInvite = Pick<Church, 'name'>;
