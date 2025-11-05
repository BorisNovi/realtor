import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { IFetchOptions } from '@shared/interfaces';
import { buildHttpParams } from '@shared/utils';
import { Observable } from 'rxjs';

export abstract class CrudBaseService<F = any> {
  protected readonly http = inject(HttpClient);

  constructor(protected readonly baseUrl: string) {}

  protected buildParams(options?: IFetchOptions<F>): HttpParams {
    let params = new HttpParams();

    if (!options) return params;

    const { filters, pagination, sort, search } = options;

    if (pagination) {
      params = params.set('first', String(pagination.first));
      params = params.set('rows', String(pagination.rows));
    }
    if (filters) params = buildHttpParams(filters, params);
    if (sort) params = buildHttpParams(sort, params);
    if (search) params = params.set('search', search);

    return params;
  }

  fetchList<TList>(endpoint: string = '', options?: IFetchOptions<F>): Observable<TList> {
    const params = this.buildParams(options);
    return this.http.get<TList>(`${this.baseUrl}/${endpoint}`, { params });
  }

  fetchOne<TDetail>(id: number, endpoint: string = ''): Observable<TDetail> {
    return this.http.get<TDetail>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create<TRequest, TResponse = TRequest>(body: TRequest, endpoint: string = ''): Observable<TResponse> {
    return this.http.post<TResponse>(`${this.baseUrl}/${endpoint}`, body);
  }

  update<TRequest extends { id: number }, TResponse = TRequest>(body: TRequest, endpoint: string = ''): Observable<TResponse> {
    return this.http.put<TResponse>(`${this.baseUrl}/${endpoint}/${body.id}`, body);
  }

  delete(id: number, endpoint?: string): Observable<void>;
  delete(ids: number[], endpoint?: string): Observable<void>;
  delete(idsOrId: number | number[], endpoint: string = ''): Observable<void> {
    let params = new HttpParams();

    if (Array.isArray(idsOrId))
      if (idsOrId.length) params = params.set('ids', JSON.stringify(idsOrId));
      else params = params.set('id', String(idsOrId));

    return this.http.delete<void>(`${this.baseUrl}/${endpoint}`, { params });
  }

  patch<TRequest, TResponse = TRequest>(id: number, body: Partial<TRequest>, endpoint: string = ''): Observable<TResponse> {
    return this.http.patch<TResponse>(`${this.baseUrl}/${endpoint}/${id}`, body);
  }
}
