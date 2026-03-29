import { ICountry } from './country.interface';
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
  firstName: string;
  lastName: string;
  phone: string;
  country: ICountry;
  defaultCountry: ICountry;
  currency: string;
}

export interface IUser extends IEntity, IUserEditable {
  bannedAt: string | null;
  role: string;
}

export interface IPasswordChange {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}
