import { PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { IPhotoItem } from './photo-item.interface';

export interface ICatalogItem {
  id: number;
  photos: IPhotoItem[];
  propertyType: PropertyType;
  zoningType: ZoningType;
  status: PropertyStatus;
  address: string;
  mapLink: string;
  price: { value: number; currency: string };
  area: number;
  dateAdded: string | Date;
}
