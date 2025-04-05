import { FurnishedStatus, HeatingType, KitchenType, RenovationStatus, ZoningType } from '@shared/enums';
import { ICatalogItem } from './catalog-item.interface';

export interface IPropertyObject extends ICatalogItem {
  comment: string;
  specifies: IPropertyObjectSpecifics;
}

export interface IPropertyObjectSpecifics {
  electricity: boolean;
  waterSupply: boolean;
  naturalGas: boolean;
  sewerage: boolean;
  heating: HeatingType;
  internet: boolean;
  forCommercialUse: boolean;
  parking?: boolean;
  bath?: boolean;
  shower?: boolean;
  airConditionig?: boolean;
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
  sharedFacilities?: { kitchen: boolean; bathroom: boolean };
  zoning?: ZoningType;
}
