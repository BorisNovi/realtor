import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { IFetchOptions, ITableData } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { CrudBaseService } from '../../base';

@Injectable({
  providedIn: 'root',
})
export class ListingsService extends CrudBaseService {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchListings(options: IFetchOptions): Observable<ITableData<any>> {
    return this.fetchList<ITableData<any>>('listings/list', options);
  }

  fetchListing(id: number): Observable<any> {
    return this.fetchOne<any>(id, 'listing');
  }

  createListing(body: any): Observable<any> {
    return this.create<any>(body, 'listing');
  }

  addObjectToListing(body: any): Observable<any> {
    return this.create<any>(body, 'listing/add_object');
  }

  updateListing(body: any): Observable<any> {
    return this.update<any>(body, 'listing');
  }

  deleteListing(id: number): Observable<void> {
    return this.delete(id, 'listing');
  }
}
