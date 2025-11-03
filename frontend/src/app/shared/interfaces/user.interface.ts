import { IEntity } from './entity.interface';

export interface ISessionUser {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IUser extends IEntity {
  bannedAt: string | null;
  email: string;
  role: string;
}
