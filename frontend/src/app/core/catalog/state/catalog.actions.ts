import { IPropertyObject } from '@shared/interfaces';

export class FetchCatalog {
  static readonly type = '[Catalog] Fetch Catalog';
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
