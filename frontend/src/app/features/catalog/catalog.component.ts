import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CATALOG_FILTERS_KEY, CATALOG_PAGINATION_KEY } from '@shared/constants';
import { ICatalogFilters, IPagination, ISort } from '@shared/interfaces';
import { DrawerModule } from 'primeng/drawer';
import { FetchCatalog, QueryParamsService, SetCatalogFilters, SetCatalogPagination, SetCatalogSort } from 'src/app/core';
import { FiltersComponent } from './components/filters/filters.component';
import { TableComponent } from './components/table/table.component';

@Component({
  selector: 'app-catalog',
  imports: [TableComponent, FiltersComponent, DrawerModule, TranslatePipe],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  readonly #store = inject(Store);
  readonly #queryParamsService = inject(QueryParamsService);

  readonly filtersCount = signal<number>(0);
  isFiltersOpen = false;

  onPaginationChange(event: IPagination): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_PAGINATION_KEY);
    this.#store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  onFiltersChange(event: ICatalogFilters): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_FILTERS_KEY);
    this.#store.dispatch([new SetCatalogFilters(event), new FetchCatalog()]);
  }

  onSortChange(event: ISort): void {
    this.#store.dispatch([new SetCatalogSort(event), new FetchCatalog()]);
  }
}
