import { FurnishedStatus, HeatingType, KitchenType, RenovationStatus } from '@shared/enums';
import { ICatalogItem } from './catalog-item.interface';

export interface IPropertyObject extends ICatalogItem {
  comment?: string;
  specifies: IPropertyObjectSpecifics;
}

export interface IPropertyObjectSpecifics {
  rooms?: number;
  floor?: { current?: number; full?: number };
  sharedFacilities?: { kitchen: boolean; bathroom: boolean };

  utilities?: {
    electricity?: boolean;
    waterSupply?: boolean;
    naturalGas?: boolean;
    sewerage?: boolean;
    heating?: HeatingType;
    internet?: boolean;
  };

  parking?: boolean;
  bath?: boolean;
  shower?: boolean;
  airConditioning?: boolean;
  fireplace?: boolean;
  beautifulView?: boolean;
  newBuilding?: boolean;
  elevator?: boolean;
  furnished?: FurnishedStatus;
  renovation?: RenovationStatus;
  balcony?: boolean;
  kitchen?: KitchenType;
  garden?: boolean;
  garage?: boolean;
}
