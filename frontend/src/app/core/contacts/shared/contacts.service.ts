import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ICatalogFilters, IContact, IPagination, ISort, ITableData } from '@shared/interfaces';
import { buildHttpParams } from '@shared/utils';
import { Observable } from 'rxjs';

// TODO: URL запросов частично моковые. Бэкендера надо пиздить палкой
@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  readonly #http = inject(HttpClient);

  fetchContacts(
    search: string | null,
    filters: ICatalogFilters,
    pagination: IPagination,
    sort: ISort | null,
  ): Observable<ITableData<IContact>> {
    let params = new HttpParams();

    if (search) params = params!.set('search', search);

    if (pagination) {
      params = params!.set('first', String(pagination.first));
      params = params!.set('rows', String(pagination.rows));
    }

    if (filters) params = buildHttpParams(filters, params);

    if (sort) params = buildHttpParams(sort, params);

    return this.#http.get<ITableData<IContact>>(`${environment.apiUrl}/contact/list`, { params });
  }

  fetchContact(id: number): Observable<IContact> {
    return this.#http.get<IContact>(`${environment.apiUrl}/contact/${id}`);
  }

  createContact(body: IContact): Observable<IContact> {
    return this.#http.post<IContact>(`${environment.apiUrl}/contact`, body);
  }

  updateContact(body: IContact): Observable<IContact> {
    return this.#http.put<IContact>(`${environment.apiUrl}/contact/${body.id}`, body);
  }

  deleteContact(id: number): Observable<void> {
    const params = new HttpParams().set('id', id);
    return this.#http.delete<void>(`${environment.apiUrl}/contact`, { params });
  }
}
