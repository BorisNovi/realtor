import { PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { IPhotoItem } from './photo-item.interface';
import { IContact } from './contact.interface';

export interface ICatalogItem {
  id: number;
  photos: IPhotoItem[];
  photosToDelete?: string[]; // Урлы фото, которые хотим удалить. Только на передачу
  propertyType: PropertyType;
  zoningType: ZoningType;
  status: PropertyStatus;
  address: string;
  mapLink: string;
  price: { value: number; currency: string };
  area: number;
  dateAdded: string | Date;
  contact: IContact;
}
