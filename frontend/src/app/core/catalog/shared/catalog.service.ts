import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor() {}

  get(): Observable<any[]> {
    const mockData = Array.from({ length: 10 }, (_, index) => ({
      photos: [`https://example.com/photos/flat${index + 1}.jpg`],
      propertyType: index % 2 === 0 ? 'flat' : 'house',
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
      status: index % 3 === 0 ? 'available' : index % 3 === 1 ? 'reserved' : 'rented',
    }));

    return of(mockData).pipe(delay(1000)); // Задержка в 1 секунду
  }
}
