import { FurnishedStatus, HeatingType, KitchenType, RenovationStatus } from '@shared/enums';
import { ICatalogItem } from './catalog-item.interface';

export interface IPropertyObject extends ICatalogItem {
  comment?: string;
  specifies: IPropertyObjectSpecifics;
}

export interface IPropertyObjectSpecifics {
  rooms?: number;
  floor?: { current?: number; full?: number };
  heating?: HeatingType;
  renovation?: RenovationStatus;
  furnished?: FurnishedStatus;
  kitchen?: KitchenType;
  sharedFacilities?: { kitchen: boolean; bathroom: boolean };

  utilities?: {
    electricity?: boolean;
    waterSupply?: boolean;
    naturalGas?: boolean;
    sewerage?: boolean;
    internet?: boolean;
  };

  options: Record<string, object | boolean>;
}
