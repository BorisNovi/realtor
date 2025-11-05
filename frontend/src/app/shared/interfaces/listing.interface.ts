import { IEntity } from './entity.interface';
import { IPropertyObject } from './property-object.interface';

export interface IListing extends IEntity {
  propoertyObjectIds: number[];
  propertyObjects: IPropertyObject[];
  companyName?: string; // Изменяется в настройках профиля
  companyLogo?: string; // Изменяется в настройках профиля
  publicLink: IPublicLink;
}

export interface IListingRequest extends IEntity {
  propoertyObjectIds?: number[];
  publicLink?: IPublicLinkUpdate;
}

export interface IPublicLinkUpdate {
  available: boolean;
}

interface IPublicLink {
  url?: string;
  available: boolean;
}
