import { FurnishedStatus, HeatingType, KitchenType, RenovationStatus } from '@shared/enums';
import { ICatalogItem } from './catalog-item.interface';

export interface IPropertyObject extends ICatalogItem {
  comment?: string;
  specifics: IPropertyObjectSpecifics;
}

export interface IPropertyObjectSpecifics {
  rooms?: number;
  floor?: { current?: number; full?: number };
  heating?: HeatingType;
  renovation?: RenovationStatus;
  furnished?: FurnishedStatus;
  kitchen?: KitchenType;

  options?: Record<string, object | boolean>;
}
