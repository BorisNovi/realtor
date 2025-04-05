import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HeatingType, PropertyStatus, PropertyType } from '@shared/enums';
import { ICatalogItem, IPagination, IPropertyObject, ITableData } from '@shared/interfaces';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);

  private mockData: IPropertyObject = {
    id: 2,
    photos: [''],
    propertyType: PropertyType.flat,
    address: 'Zalupinsk',
    mapLink: 'map',
    price: {
      value: 590,
      currency: 'USD',
    },
    area: 78,
    rooms: 3,
    floor: {
      current: 24,
      full: 42,
    },
    dateAdded: `2025-03-01`,
    status: PropertyStatus.available,
    comment: 'comment',
    specifies: {
      forCommercialUse: false,
      electricity: true,
      waterSupply: true,
      naturalGas: false,
      sewerage: true,
      heating: HeatingType.electric,
      internet: true,
      bath: false,
      shower: false,
      airConditionig: false,
      fireplace: false,
      beautifulView: false,
      newBuilding: false,
      elevator: false,
    },
  };

  public fetchCatalog(filters: any, pagination: IPagination): Observable<ITableData<ICatalogItem>> {
    console.log('fetch', filters, pagination);
    const { search } = filters;

    const mockData = Array.from({ length: 31 }, (_, index) => ({
      id: index,
      photos: [`https://picsum.photos/id/${index + 100}/400/300`],
      propertyType: index % 2 === 0 ? PropertyType.flat : PropertyType.house,
      address: `Город ${index + 1}, ул. Примерная, д. ${10 + index}`,
      mapLink: `https://maps.example.com/?lat=${55.751244 + index * 0.1}&lng=${37.618423 + index * 0.1}`,
      price: {
        value: 12000000 + index * 1000000, // Разные цены
        currency: index % 3 === 0 ? 'USD' : 'RUB',
      },
      area: 65 + index * 10, // Разная площадь
      rooms: 1 + (index % 4), // 1-4 комнаты
      floor: {
        current: 1 + (index % 10), // Этаж от 1 до 10
        full: index % 2 === 0 ? 24 : 9, // Разная этажность
      },
      dateAdded: `2025-03-${10 + index}`,
      status: index % 3 === 0 ? PropertyStatus.available : index % 3 === 1 ? PropertyStatus.reserved : PropertyStatus.rented,
    }));

    const params = new HttpParams({
      fromObject: {
        ...(pagination && { page: String(pagination.first) }),
        ...(pagination && { page_size: String(pagination.rows) }),
        ...(search && { search }),
      },
    });

    return of({ items: mockData, total: 31 }).pipe(delay(1000)); // Задержка в 1 секунду
    this.http.get<ITableData<ICatalogItem>>(`${environment.apiUrl}/catalog`, { params });
  }

  public fetchPropertyObject(id: number): Observable<IPropertyObject> {
    console.log('get', id);
    return of(this.mockData).pipe(delay(1000));
    // this.http.get<IPropertyObject>(`${environment.apiUrl}/catalog/${id}`);
  }

  public createPropertyObject(body: ICatalogItem): Observable<IPropertyObject> {
    console.log('create', body);
    return of(this.mockData).pipe(delay(1000));
    this.http.post<IPropertyObject>(`${environment.apiUrl}/catalog`, body);
  }

  public updatePropertyObject(body: ICatalogItem): Observable<IPropertyObject> {
    console.log('update', body);
    return of(this.mockData).pipe(delay(1000));
    this.http.put<IPropertyObject>(`${environment.apiUrl}/catalog`, body);
  }

  public deletePropertyObject(id: number[]): Observable<any> {
    console.log('delete', id);
    return of(null).pipe(delay(1000));
    this.http.delete<void>(`${environment.apiUrl}/catalog`);
  }
}
