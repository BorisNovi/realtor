import { ICountry } from './country.interface';
import { IEntity } from './entity.interface';

export interface ISessionUser {
  user: IUser;
  accessToken: string;
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
  role: UserRole;
  plan: UserPlan;
  limits: {
    objects: number;
    contacts: number;
    listings: number;
  }
}

export interface IPasswordChange {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export enum UserRole {
  default = 'User',
  admin = 'Admin',
}

export enum UserPlan {
  free,
  standard,
}
