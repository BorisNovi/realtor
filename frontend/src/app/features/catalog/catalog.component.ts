import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TableComponent } from './components/table/table.component';
import { ICatalogFilters, IPagination } from '@shared/interfaces';
import { DrawerModule } from 'primeng/drawer';
import { FiltersComponent } from './components/filters/filters.component';
import { Store } from '@ngxs/store';
import { FetchCatalog, QueryParamsService, SetCatalogFilters, SetCatalogPagination } from 'src/app/core';
import { CATALOG_FILTERS_KEY, CATALOG_PAGINATION_KEY } from '@shared/constants';

@Component({
  selector: 'app-catalog',
  imports: [TranslatePipe, TableComponent, FiltersComponent, DrawerModule],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  readonly #store = inject(Store);
  readonly #queryParamsService = inject(QueryParamsService);

  isFiltersOpen = false;

  onPaginationChange(event: IPagination): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_PAGINATION_KEY);
    this.#store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  onFiltersChange(event: ICatalogFilters): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_FILTERS_KEY);
    this.#store.dispatch([new SetCatalogFilters(event), new FetchCatalog()]);
  }
}
