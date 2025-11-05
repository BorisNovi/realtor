import { IListingRequest, IPagination, IPublicLinkUpdate, ISort } from '@shared/interfaces';

export class FetchListings {
  static readonly type = '[Listing] Fetch Listings';
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
  constructor(public readonly listing: IListingRequest) {}
}

export class UpdateListing {
  static readonly type = '[Listings] Update Listing';
  constructor(public readonly listing: IListingRequest) {}
}

export class ChangeListingAvaliability {
  static readonly type = '[Listings] Change Listing Avaliability';
  constructor(
    public readonly id: number,
    public readonly publicLink: IPublicLinkUpdate,
  ) {}
}

export class DeleteListing {
  static readonly type = '[Listings] Delete Listings';
  constructor(public readonly idList: number[]) {}
}

export class ListingsOperationSuccess {
  public static readonly type = '[Listings] ListingsOperationSuccess';
  constructor(public readonly message?: string) {}
}

export class ListingsOperationFailed {
  public static readonly type = '[Listings] ListingsOperationFailed';
  constructor(
    public readonly error: Error,
    public readonly message?: string,
  ) {}
}
