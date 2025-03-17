import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TableComponent } from './components/table/table.component';
import { ICatalogItem } from '@shared/interfaces';
import { PropertyStatus, PropertyType } from '@shared/enums';
import { DrawerModule } from 'primeng/drawer';
import { FiltersComponent } from './components/filters/filters.component';
import { Store } from '@ngxs/store';
import { CatalogState, FetchCatalog } from 'src/app/core';

@Component({
  selector: 'app-catalog',
  imports: [TranslatePipe, TableComponent, FiltersComponent, DrawerModule],
  templateUrl: './catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  private readonly store = inject(Store);
  public tableData = this.store.selectSignal(CatalogState.catalog);

  public isFiltersOpen = false;

  constructor() {
    // TODO: перенести в резолвер
    this.store.dispatch(new FetchCatalog());
  }
}
