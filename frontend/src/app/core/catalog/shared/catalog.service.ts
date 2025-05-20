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
      utilities: {
        electricity: true,
        waterSupply: true,
        naturalGas: false,
        sewerage: true,
        heating: HeatingType.electric,
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
    const mockData = Array.from({ length: 31 }, (_, index) => ({
      id: index,
      photos: [`https://picsum.photos/id/${index + 100}/400/300`],
      propertyType: index % 2 === 0 ? PropertyType.flat : PropertyType.house,
      status: index % 3 === 0 ? PropertyStatus.available : index % 3 === 1 ? PropertyStatus.reserved : PropertyStatus.rented,
      zoningType: ZoningType.mixed,
      address: `Город ${index + 1}, ул. Примерная, д. ${10 + index}`,
      mapLink: `https://maps.example.com/?lat=${55.751244 + index * 0.1}&lng=${37.618423 + index * 0.1}`,
      price: {
        value: 12000000 + index * 1000000, // Разные цены
        currency: index % 3 === 0 ? 'USD' : 'RUB',
      },
      area: 65 + index * 10, // Разная площадь
      dateAdded: `2025-03-${10 + index}`,
      contact: {
        id: index,
        name: 'test',
        phone: '+99564738384',
      },
    }));

    const params = new HttpParams({
      fromObject: {
        ...(pagination && { first: String(pagination.first) }),
        ...(pagination && { rows: String(pagination.rows) }),
        // ...(search && { search }),
      },
    });

    return of({ items: mockData, total: 31 }).pipe(delay(500)); // Задержка в 1 секунду
    this.#http.get<ITableData<ICatalogItem>>(`${environment.apiUrl}/catalog`, { params });
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
