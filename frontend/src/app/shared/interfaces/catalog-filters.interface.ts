import { PropertyType, ZoningType, PropertyStatus, Currency } from '@shared/enums';

export interface ICatalogFilters {
  search?: string;
  dateAdded?: {
    from?: Date | string | null;
    to?: Date | string | null;
  };
  status?: PropertyStatus | null;
  propertyType?: PropertyType[] | null;
  zoningType?: ZoningType[] | null;
  area?: {
    min?: number | null;
    max?: number | null;
  };
  price?: {
    currency?: Currency | null;
    min?: number | null;
    max?: number | null;
  };
}
