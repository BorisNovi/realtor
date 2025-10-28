import { IEntity } from './entity.interface';
import { IPropertyObject } from './property-object.interface';

export interface IListing extends IEntity {
  propertyObjects: IPropertyObject[];
  publicLink: IPublicLink;
  companyName?: string;
  companyLogo?: string; // imageURL
}

interface IPublicLink {
  url: string;
  available: boolean;
}
