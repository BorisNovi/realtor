import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CATALOG_FILTERS_KEY } from '@shared/constants';
import { ICatalogFilters } from '@shared/interfaces';
import { DrawerModule } from 'primeng/drawer';
import { CatalogState, FetchCatalog, FetchCatalogMap, QueryParamsService, SetCatalogFilters } from 'src/app/core';
import { CatalogFiltersService } from './catalog-filters.service';
import { FiltersComponent } from './components/filters/filters.component';

@Component({
  selector: 'rx-catalog',
  imports: [FiltersComponent, DrawerModule, TranslatePipe, RouterOutlet],
  providers: [CatalogFiltersService],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  readonly #store = inject(Store);
  readonly #queryParamsService = inject(QueryParamsService);
  readonly filtersService = inject(CatalogFiltersService);

  readonly filtersCount = signal<number>(0);
  isFiltersOpen = false;

  onFiltersChange(event: ICatalogFilters): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_FILTERS_KEY);
    const box = this.#store.selectSignal(CatalogState.loadedBox)

    // TODO: этот пиздец переделать. Два запроса нам не надо.
    this.#store.dispatch([new SetCatalogFilters(event), new FetchCatalog(), new FetchCatalogMap(box() || {maxLat: 0, minLng: 0, minLat:0, maxLng: 0})]);
  }
}
