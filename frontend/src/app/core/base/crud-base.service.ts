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

    const { filters, pagination, sort, search, query } = options;

    if (pagination) {
      params = params.set('first', String(pagination.first));
      params = params.set('rows', String(pagination.rows));
    }
    if (filters) params = buildHttpParams(filters, params);
    if (sort) params = buildHttpParams(sort, params);
    if (query) params = buildHttpParams(query, params);
    if (search) params = params.set('search', search);

    return params;
  }

  protected fetchList<TList>(endpoint: string = '', options?: IFetchOptions<F>): Observable<TList> {
    const params = this.buildParams(options);
    return this.http.get<TList>(`${this.baseUrl}/${endpoint}`, { params });
  }

  protected fetchOne<TDetail>(id: number, endpoint: string = ''): Observable<TDetail> {
    return this.http.get<TDetail>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  protected create<TRequest, TResponse = TRequest>(body: TRequest, endpoint: string = ''): Observable<TResponse> {
    return this.http.post<TResponse>(`${this.baseUrl}/${endpoint}`, body);
  }

  protected update<TRequest extends { id: number }, TResponse = TRequest>(
    body: TRequest,
    endpoint: string = '',
  ): Observable<TResponse> {
    return this.http.put<TResponse>(`${this.baseUrl}/${endpoint}/${body.id}`, body);
  }

  protected delete(id: number, endpoint?: string): Observable<void>;
  protected delete(ids: number[], endpoint?: string): Observable<void>;
  protected delete(idsOrId: number | number[], endpoint: string = ''): Observable<void> {
    let params = new HttpParams();

    if (Array.isArray(idsOrId))
      if (idsOrId.length) params = params.set('ids', JSON.stringify(idsOrId));
      else params = params.set('id', String(idsOrId));

    return this.http.delete<void>(`${this.baseUrl}/${endpoint}`, { params });
  }

  protected patch<TRequest, TResponse = TRequest>(body: Partial<TRequest>, endpoint: string): Observable<TResponse>;
  protected patch<TRequest, TResponse = TRequest>(id: number, body: Partial<TRequest>, endpoint: string): Observable<TResponse>;
  protected patch<TRequest, TResponse = TRequest>(
    arg1: number | Partial<TRequest>,
    arg2: Partial<TRequest> | string,
    arg3?: string,
  ): Observable<TResponse> {
    const hasId = typeof arg1 === 'number';
    const endpoint = hasId ? (arg3 ?? '') : (arg2 as string);

    return this.http.patch<TResponse>(
      hasId ? `${this.baseUrl}/${endpoint}/${arg1}` : `${this.baseUrl}/${endpoint}`,
      hasId ? (arg2 as Partial<TRequest>) : (arg1 as Partial<TRequest>),
    );
  }
}
