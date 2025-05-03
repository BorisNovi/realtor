import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TableComponent } from './components/table/table.component';
import { ICatalogFilters, IPagination } from '@shared/interfaces';
import { DrawerModule } from 'primeng/drawer';
import { FiltersComponent } from './components/filters/filters.component';
import { Store } from '@ngxs/store';
import { FetchCatalog, SetCatalogFilters, SetCatalogPagination } from 'src/app/core';

@Component({
  selector: 'app-catalog',
  imports: [TranslatePipe, TableComponent, FiltersComponent, DrawerModule],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  readonly #store = inject(Store);

  isFiltersOpen = false;

  constructor() {
    // TODO: перенести в резолвер
    this.#store.dispatch(new FetchCatalog());
  }

  onPaginationChange(event: IPagination): void {
    this.#store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  onFiltersChange(event: ICatalogFilters): void {
    this.#store.dispatch([new SetCatalogFilters(event), new FetchCatalog()]);
  }
}
