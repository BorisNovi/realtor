import { PropertyStatus, PropertyType, ZoningType } from '@shared/enums';

export interface ICatalogItem {
  id: number;
  photos: string[];
  propertyType: PropertyType;
  zoningType: ZoningType;
  status: PropertyStatus;
  address: string;
  mapLink: string;
  price: { value: number; currency: string };
  area: number;
  dateAdded: string | Date;
}
