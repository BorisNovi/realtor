import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableComponent } from '../table/table.component';
import { Store } from '@ngxs/store';
import { FetchCatalog, QueryParamsService, SetCatalogPagination, SetCatalogSort } from 'src/app/core';
import { IPagination, ISort } from '@shared/interfaces';
import { CATALOG_PAGINATION_KEY } from '@shared/constants';
import { CatalogFiltersService } from '../../catalog-filters.service';

@Component({
  selector: 'rx-catalog-list',
  imports: [TableComponent],
  templateUrl: './catalog-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogListComponent {
  readonly #store = inject(Store);
  readonly #queryParamsService = inject(QueryParamsService);
  readonly filtersService = inject(CatalogFiltersService);

  onPaginationChange(event: IPagination): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_PAGINATION_KEY);
    this.#store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  onSortChange(event: ISort): void {
    this.#store.dispatch([new SetCatalogSort(event), new FetchCatalog()]);
  }
}
