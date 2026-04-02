import { IEntity } from './entity.interface';
import { IPropertyObject } from './property-object.interface';

export interface IListing extends IEntity {
  propertyObjectIds: number[];
  propertyObjects: IPropertyObject[];
  companyName?: string; // Изменяется в настройках профиля
  companyLogo?: string; // Изменяется в настройках профиля
  firstName?: string; // Имя риелтора. Изменяется в настройках профиля
  lastName?: string; // Фамилия риелтора. Изменяется в настройках профиля
  phone?: string; // Телефон риелтора. Изменяется в настройках профиля
  publicLink: IPublicLink;
}

export interface IListingRequest extends IEntity {
  propertyObjectIds?: number[];
  publicLink?: IPublicLinkUpdate;
}

export interface IPublicLinkUpdate {
  available: boolean;
}

export interface IPublicLink {
  token?: string;
  available: boolean;
}
