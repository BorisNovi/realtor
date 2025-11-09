import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { PropertyStatus } from '@shared/enums';
import { ICatalogFilters, ICatalogItem, IFetchOptions, IPropertyObject, ITableData } from '@shared/interfaces';
import { CrudBaseService } from '../../base';

@Injectable({
  providedIn: 'root',
})
export class CatalogService extends CrudBaseService<ICatalogFilters> {
  constructor() {
    super(`${environment.apiUrl}`);
  }

  fetchCatalog(options: IFetchOptions<ICatalogFilters>) {
    return this.fetchList<ITableData<ICatalogItem>>('catalog', options);
  }

  fetchPropertyObject(id: number) {
    return this.fetchOne<IPropertyObject>(id, 'property_object');
  }

  createPropertyObject(body: IPropertyObject) {
    return this.create<IPropertyObject>(body, 'property_object');
  }

  updatePropertyObject(body: IPropertyObject) {
    return this.update<IPropertyObject>(body, 'property_object');
  }

  updateStatus(id: number, status: PropertyStatus) {
    return this.patch<IPropertyObject>(id, { status }, 'property_object');
  }

  deletePropertyObject(ids: number[]) {
    return this.delete(ids, 'catalog/delete');
  }
}
