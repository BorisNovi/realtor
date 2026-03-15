import { IListingRequest, IPagination, IPublicLinkUpdate, ISort } from '@shared/interfaces';

export class FetchListings {
  static readonly type = '[Listing] Fetch Listings';
}

export class SetListingsSearch {
  public static readonly type = '[Listings] Set Listings Search';
  constructor(public readonly search: string) {}
}

export class SetListingsPagination {
  public static readonly type = '[Listings] Set Listings Pagination';
  constructor(public readonly pagination: IPagination) {}
}

export class SetListingsSort {
  public static readonly type = '[Listings] Set Listings Sort';
  constructor(public readonly sort: ISort) {}
}

export class FetchListing {
  static readonly type = '[Listings] Fetch Listing';
  constructor(public readonly id: number) {}
}

export class CreateListing {
  static readonly type = '[Listings] Create Listing';
  constructor(
    public readonly listing: IListingRequest,
    public readonly opts?: { getList: boolean },
  ) {}
}

export class UpdateListing {
  static readonly type = '[Listings] Update Listing';
  constructor(
    public readonly listing: IListingRequest,
    public readonly opts?: { getList: boolean },
  ) {}
}

export class ChangeListingAvaliability {
  static readonly type = '[Listings] Change Listing Avaliability';
  constructor(
    public readonly id: number,
    public readonly publicLink: IPublicLinkUpdate,
    public readonly opts?: { getList: boolean },
  ) {}
}

export class DeleteListing {
  static readonly type = '[Listings] Delete Listings';
  constructor(
    public readonly idList: number[],
    public readonly opts?: { getList: boolean },
  ) {}
}

export class ListingsOperationSuccess {
  public static readonly type = '[Listings] ListingsOperationSuccess';
  constructor(
    public readonly message?: string,
    public readonly getList?: boolean,
  ) {}
}

export class ListingsOperationFailed {
  public static readonly type = '[Listings] ListingsOperationFailed';
  constructor(
    public readonly error: Error,
    public readonly message?: string,
  ) {}
}
