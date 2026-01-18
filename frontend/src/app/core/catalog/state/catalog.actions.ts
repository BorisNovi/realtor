import { PropertyStatus } from '@shared/enums';
import { ICatalogFilters, IMapBox, IPagination, IPropertyObject, ISort } from '@shared/interfaces';

export class FetchCatalog {
  static readonly type = '[Catalog] Fetch Catalog';
}

export class FetchCatalogMap {
  static readonly type = '[Catalog] Fetch Catalog Map';
  constructor(public readonly box: IMapBox) {}
}

export class SetCatalogPagination {
  public static readonly type = '[Catalog] Set Catalog Pagination';
  constructor(public readonly pagination: IPagination) {}
}

export class SetCatalogFilters {
  public static readonly type = '[Catalog] Set Catalog Filters';
  constructor(public readonly filters: ICatalogFilters) {}
}

export class SetCatalogSort {
  public static readonly type = '[Catalog] Set Catalog Sort';
  constructor(public readonly sort: ISort) {}
}

export class FetchPropertyObject {
  static readonly type = '[Catalog] Fetch Property Object';
  constructor(public readonly id: number) {}
}

export class CreatePropertyObject {
  static readonly type = '[Catalog] Create Property Object';
  constructor(
    public readonly propertyObject: IPropertyObject,
    public readonly opts?: { getList: boolean },
  ) {}
}

export class UpdatePropertyObject {
  static readonly type = '[Catalog] Update Property Object';
  constructor(
    public readonly propertyObject: IPropertyObject,
    public readonly opts?: { getList: boolean },
  ) {}
}

export class UpdateStatus {
  static readonly type = '[Catalog] Update Status';
  constructor(
    public readonly id: number,
    public readonly status: PropertyStatus,
    public readonly opts?: { getList: boolean },
  ) {}
}

export class DeletePropertyObjects {
  static readonly type = '[Catalog] Delete Property Objects';
  constructor(
    public readonly idList: number[],
    public readonly opts?: { getList: boolean },
  ) {}
}

export class CatalogOperationSuccess {
  public static readonly type = '[Catalog] CatalogOperationSuccess';
  constructor(
    public readonly message?: string,
    public readonly getList?: boolean,
  ) {}
}

export class CatalogOperationFailed {
  public static readonly type = '[Catalog] CatalogOperationFailed';
  constructor(
    public readonly error: Error,
    public readonly message?: string,
  ) {}
}
