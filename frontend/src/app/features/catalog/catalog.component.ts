import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TableComponent } from './components/table/table.component';
import { ICatalogItem } from '@shared/interfaces';
import { PropertyStatus, PropertyType } from '@shared/enums';
import { DrawerModule } from 'primeng/drawer';
import { FiltersComponent } from './components/filters/filters.component';

@Component({
  selector: 'app-catalog',
  imports: [TranslatePipe, TableComponent, FiltersComponent, DrawerModule],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  // TODO: не забудь про pageSize и pageIndex
  public isFiltersOpen = false;
  public readonly mockTableData: ICatalogItem[] = [
    {
      id: 1,
      photos: ['https://picsum.photos/300/200'],
      propertyType: PropertyType.flat,
      address: 'Москва, ул. Ленина, д. 10',
      mapLink: 'https://maps.example.com/?lat=55.751244&lng=37.618423',
      price: { value: 12000000, currency: 'RUB' },
      area: 65,
      rooms: 2,
      floor: { current: 6, full: 24 },
      dateAdded: '2025-03-10',
      status: PropertyStatus.available,
    },
    {
      id: 2,
      photos: ['https://picsum.photos/200', 'https://picsum.photos/200'],
      propertyType: PropertyType.house,
      address: 'Ростов-на-Дону, ул. Садовая, д. 25',
      mapLink: 'https://maps.example.com/?lat=47.235713&lng=39.701505',
      price: { value: 8500000, currency: 'RUB' },
      area: 120,
      rooms: 4,
      floor: { current: 1, full: 1 },
      dateAdded: '2025-03-12',
      status: PropertyStatus.reserved,
    },
    {
      id: 3,
      photos: ['https://picsum.photos/200'],
      propertyType: PropertyType.flat,
      address: 'Тбилиси, пр. Руставели, д. 15',
      mapLink: 'https://maps.example.com/?lat=41.698143&lng=44.793998',
      price: { value: 150000, currency: 'USD' },
      area: 42,
      rooms: 1,
      floor: { current: 3, full: 12 },
      dateAdded: '2025-03-08',
      status: PropertyStatus.rented,
    },
    {
      id: 4,
      photos: ['https://picsum.photos/200', 'https://picsum.photos/200'],
      propertyType: PropertyType.flat,
      address: 'Санкт-Петербург, наб. Фонтанки, д. 8',
      mapLink: 'https://maps.example.com/?lat=59.934280&lng=30.335098',
      price: { value: 9800000, currency: 'RUB' },
      area: 78,
      rooms: 3,
      floor: { current: 2, full: 5 },
      dateAdded: '2025-03-14',
      status: PropertyStatus.available,
    },
  ];
}
