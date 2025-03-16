import { PropertyStatus, PropertyType } from '@shared/enums';

export interface ICatalogItem {
  id: number;
  photos: string[];
  propertyType: PropertyType;
  address: string;
  mapLink: string;
  price: { value: number; currency: string };
  area: number;
  rooms: number;
  floor: { current: number; full: number };
  dateAdded: string | Date;
  status: PropertyStatus;
}
