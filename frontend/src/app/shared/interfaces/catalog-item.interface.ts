import { PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { IAddress } from './address.interface';
import { IContact } from './contact.interface';
import { IEntity } from './entity.interface';

export interface ICatalogItem extends IEntity {
  photos: string[];
  propertyType: PropertyType;
  zoningType: ZoningType;
  status: PropertyStatus;
  address: IAddress;
  price: { value: number; currency: string };
  area: number;
  contact: IContact;
}

export interface ICatalogMapItem extends IEntity {
  propertyType: PropertyType;
  status: PropertyStatus;
  address: IAddress;
}
