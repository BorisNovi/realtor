import { IEntity } from './entity.interface';
import { IPropertyObject } from './property-object.interface';

export interface IListing extends IEntity {
  propoertyObjectIds: number[];
  publicLink: IPublicLink;
}

export interface IListingDetailed extends IListing {
  propertyObjects: IPropertyObject[];
  companyName?: string;
  companyLogo?: string; // imageURL
}

interface IPublicLink {
  url: string;
  available: boolean;
}
