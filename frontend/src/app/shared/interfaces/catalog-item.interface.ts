import { PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { IAddress } from './address.interface';
import { IContact } from './contact.interface';

export interface ICatalogItem {
  id: number;
  photos: string[];
  propertyType: PropertyType;
  zoningType: ZoningType;
  status: PropertyStatus;
  address: IAddress;
  mapLink: string;
  price: { value: number; currency: string };
  area: number;
  dateAdded: string | Date;
  contact: IContact;
}
