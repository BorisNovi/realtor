import { IPagination, IPropertyObject } from '@shared/interfaces';

export class FetchCatalog {
  static readonly type = '[Catalog] Fetch Catalog';
}

export class SetCatalogPagination {
  public static readonly type = '[Catalog] Set Catalog Pagination';
  constructor(public readonly pagination: IPagination) {}
}

export class FetchPropertyObject {
  static readonly type = '[Catalog] Fetch Property Object';
  constructor(public readonly id: number) {}
}

export class CreatePropertyObject {
  static readonly type = '[Catalog] Create Property Object';
  constructor(public readonly propertyObject: IPropertyObject) {}
}

export class UpdatePropertyObject {
  static readonly type = '[Catalog] Update Property Object';
  constructor(public readonly propertyObject: IPropertyObject) {}
}

export class DeletePropertyObjects {
  static readonly type = '[Catalog] Delete Property Objects';
  constructor(public readonly idList: number[]) {}
}

export class CatalogOperationSuccess {
  public static readonly type = '[Catalog] CatalogOperationSuccess';
  constructor(public readonly message?: string) {}
}

export class CatalogOperationFailed {
  public static readonly type = '[Catalog] CatalogOperationFailed';
  constructor(
    public readonly error: Error,
    public readonly message?: string,
  ) {}
}
