import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { IFetchOptions, IListing, IListingRequest, IPublicLinkUpdate, ITableData } from '@shared/interfaces';
import { CrudBaseService } from '../../base';

@Injectable({
  providedIn: 'root',
})
export class ListingsService extends CrudBaseService {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchListings(options: IFetchOptions) {
    return this.fetchList<ITableData<IListing>>('listing/list', options);
  }

  fetchListing(id: number) {
    return this.fetchOne<IListing>(id, 'listing');
  }

  createListing(body: IListingRequest) {
    return this.create<IListingRequest, IListing>(body, 'listing');
  }
  // Удаляем и добавляем объекты тоже через этот метод
  updateListing(body: IListingRequest) {
    return this.update<IListingRequest, IListing>(body, 'listing');
  }

  changeListingAvailability(id: number, publicLink: IPublicLinkUpdate) {
    return this.patch<IListingRequest, IListing>(id, { publicLink }, 'listing');
  }

  deleteListing(ids: number[]) {
    return this.delete(ids, 'listing');
  }
}
