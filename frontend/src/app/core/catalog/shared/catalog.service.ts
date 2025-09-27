import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { PropertyStatus } from '@shared/enums';
import { ICatalogFilters, ICatalogItem, IFetchOptions, IPropertyObject, ITableData } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { CrudBaseService } from '../../base';

@Injectable({
  providedIn: 'root',
})
export class CatalogService extends CrudBaseService<ICatalogFilters> {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchCatalog(options: IFetchOptions<ICatalogFilters>): Observable<ITableData<ICatalogItem>> {
    return this.fetchList<ITableData<ICatalogItem>>('catalog', options);
  }

  fetchPropertyObject(id: number): Observable<IPropertyObject> {
    return this.fetchOne<IPropertyObject>(id, 'property_object');
  }

  createPropertyObject(body: IPropertyObject): Observable<IPropertyObject> {
    return this.create<IPropertyObject>(body, 'property_object');
  }

  updatePropertyObject(body: IPropertyObject): Observable<IPropertyObject> {
    return this.update<IPropertyObject & { id: number }>(body, 'property_object');
  }

  updateStatus(id: number, status: PropertyStatus): Observable<IPropertyObject> {
    return this.patch<IPropertyObject>(id, { status }, 'property_object');
  }

  deletePropertyObject(ids: number[]): Observable<void> {
    return this.delete(ids, 'catalog/delete');
  }
}
