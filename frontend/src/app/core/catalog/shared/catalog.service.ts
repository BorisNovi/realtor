import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { PropertyStatus } from '@shared/enums';
import { ICatalogFilters, ICatalogItem, IPagination, IPropertyObject, ISort, ITableData } from '@shared/interfaces';
import { buildHttpParams } from '@shared/utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  readonly #http = inject(HttpClient);

  fetchCatalog(filters: ICatalogFilters, pagination: IPagination, sort: ISort | null): Observable<ITableData<ICatalogItem>> {
    let params = new HttpParams();

    if (pagination) {
      params = params!.set('first', String(pagination.first));
      params = params!.set('rows', String(pagination.rows));
    }

    if (filters) {
      params = buildHttpParams(filters, params);
    }

    if (sort) {
      params = buildHttpParams(sort, params);
    }

    return this.#http.get<ITableData<ICatalogItem>>(`${environment.apiUrl}/catalog`, { params });
  }

  fetchPropertyObject(id: number): Observable<IPropertyObject> {
    return this.#http.get<IPropertyObject>(`${environment.apiUrl}/catalog/${id}`);
  }

  createPropertyObject(body: IPropertyObject): Observable<IPropertyObject> {
    return this.#http.post<IPropertyObject>(`${environment.apiUrl}/property_object`, body);
  }

  updatePropertyObject(body: IPropertyObject): Observable<IPropertyObject> {
    return this.#http.put<IPropertyObject>(`${environment.apiUrl}/catalog`, body);
  }

  updateStatus(id: number, status: PropertyStatus): Observable<IPropertyObject> {
    const body = { status };
    return this.#http.patch<IPropertyObject>(`${environment.apiUrl}/catalog/${id}`, body);
  }

  deletePropertyObject(ids: number[]): Observable<void> {
    let params = new HttpParams();
    if (ids.length) {
      params = params.set('ids', JSON.stringify(ids));
    }
    return this.#http.delete<void>(`${environment.apiUrl}/catalog`, { params });
  }
}
