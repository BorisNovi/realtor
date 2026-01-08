import { IEntity } from './entity.interface';

export interface ISessionUser {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IUserEditable {
  email: string;
  companyLogo: string;
  companyName: string;
}

export interface IUser extends IEntity, IUserEditable {
  bannedAt: string | null;
  role: string;
}

export interface IPasswordChange {
  password: string;
  password_confirmation: string;
}
