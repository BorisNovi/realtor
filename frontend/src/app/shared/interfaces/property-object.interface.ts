import { ICatalogItem } from './catalog-item.interface';

export interface IPropertyObject extends ICatalogItem {
  comment: string;
  specifies: IPropertyObjectSpecifics;
}

export interface IPropertyObjectSpecifics {
  bath: boolean;
  shower: boolean;
  airConditionig: boolean;
  fireplace: boolean;
  beautifulView: boolean;
  newBuilding: boolean;
  elevator: boolean;
}
