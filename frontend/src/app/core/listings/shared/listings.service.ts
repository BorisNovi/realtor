import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { IFetchOptions, ITableData } from '@shared/interfaces';
import { IListing, IListingDetailed } from '@shared/interfaces/listing.interface';
import { CrudBaseService } from '../../base';

@Injectable({
  providedIn: 'root',
})
export class ListingsService extends CrudBaseService {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchListings(options: IFetchOptions) {
    return this.fetchList<ITableData<IListing>>('listings/list', options);
  }

  fetchListing(id: number) {
    return this.fetchOne<IListingDetailed>(id, 'listing');
  }

  createListing(body: IListing) {
    return this.create<IListing, IListingDetailed>(body, 'listing');
  }
  // Удаляем и добавляем объекты тоже через этот метод
  updateListing(body: IListing) {
    return this.update<IListing, IListingDetailed>(body, 'listing');
  }

  deleteListing(ids: number[]) {
    return this.delete(ids, 'listing');
  }
}
