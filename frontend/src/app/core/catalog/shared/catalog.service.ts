import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HeatingType, PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { ICatalogFilters, ICatalogItem, IPagination, IPropertyObject, ITableData } from '@shared/interfaces';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  readonly #http = inject(HttpClient);

  #mockData: IPropertyObject = {
    id: 2,
    photos: ['https://picsum.photos/id/101/400/300', 'https://picsum.photos/id/102/400/300'],
    propertyType: PropertyType.flat,
    status: PropertyStatus.available,
    zoningType: ZoningType.commercial,
    address: 'Zalupinsk',
    mapLink: 'https://maps.app.goo.gl/xhQ5g4NWNXUS5FFp8',
    price: {
      value: 590,
      currency: 'USD',
    },
    area: 78,
    dateAdded: `2025-03-01`,
    contact: {
      id: 0,
      name: 'test',
      phone: '+99564738384',
    },
    comment: 'comment',
    specifies: {
      rooms: 3,
      floor: { current: 5, full: 9 },
      heating: HeatingType.electric,
      utilities: {
        electricity: true,
        waterSupply: true,
        naturalGas: false,
        sewerage: true,
        internet: true,
      },
      bath: false,
      shower: false,
      airConditioning: false,
      fireplace: false,
      beautifulView: false,
      newBuilding: false,
      elevator: false,
    },
  };

  fetchCatalog(filters: ICatalogFilters, pagination: IPagination): Observable<ITableData<ICatalogItem>> {
    let params = new HttpParams();

    if (pagination) {
      params = params.set('first', String(pagination.first));
      params = params.set('rows', String(pagination.rows));
    }

    // TODO: вынести в хелпер
    const appendParams = (obj: any, prefix = ''): void => {
      Object.entries(obj).forEach(([key, value]) => {
        const paramKey = prefix ? `${prefix}.${key}` : key;
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'object' && item !== null) {
                appendParams(item, `${paramKey}[${index}]`);
              } else {
                params = params.append(`${paramKey}[${index}]`, String(item));
              }
            });
          } else if (typeof value === 'object' && !(value instanceof Date)) {
            appendParams(value, paramKey);
          } else {
            const paramValue = value instanceof Date ? value.toISOString() : String(value);
            params = params.set(paramKey, paramValue);
          }
        }
      });
    };

    if (filters) {
      appendParams(filters);
    }

    return this.#http.get<ITableData<ICatalogItem>>(`${environment.apiUrl}/catalog`, { params });
  }

  fetchPropertyObject(id: number): Observable<IPropertyObject> {
    console.debug('get', id);
    return of(this.#mockData).pipe(delay(1000));
    // this.http.get<IPropertyObject>(`${environment.apiUrl}/catalog/${id}`);
  }

  createPropertyObject(body: IPropertyObject): Observable<IPropertyObject> {
    // console.debug('create', body);
    // return of(this.mockData).pipe(delay(1000));
    return this.#http.post<IPropertyObject>(`${environment.apiUrl}/property_object`, body);
  }

  updatePropertyObject(body: IPropertyObject): Observable<IPropertyObject> {
    console.debug('update', body);
    return of(this.#mockData).pipe(delay(1000));
    this.#http.put<IPropertyObject>(`${environment.apiUrl}/catalog`, body);
  }

  updateStatus(id: number, status: PropertyStatus): Observable<IPropertyObject> {
    console.debug('update status', id, status);
    return of(this.#mockData).pipe(delay(1000));
  }

  deletePropertyObject(id: number[]): Observable<any> {
    console.debug('delete', id);
    return of(null).pipe(delay(1000));
    this.#http.delete<void>(`${environment.apiUrl}/catalog`);
  }
}
