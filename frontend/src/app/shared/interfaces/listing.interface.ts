import { IPropertyObject } from './property-object.interface';

export interface IListing {
  id: number;
  dateAdded: string | Date;
  name: string;
  propertyObjects: IPropertyObject[];
  publicLink: IPublicLink;
  companyName?: string;
  companyLogo?: string; // imageURL
}

interface IPublicLink {
  url: string;
  available: boolean;
}
