import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CATALOG_PAGINATION_KEY } from '@shared/constants';
import { IPagination, ISort } from '@shared/interfaces';
import { FetchCatalog, QueryParamsService, SetCatalogPagination, SetCatalogSort } from 'src/app/core';
import { ContactsTableComponent } from './components/contacts-table/contacts-table.component';

@Component({
  selector: 'rx-contacts',
  imports: [TranslatePipe, ContactsTableComponent],
  templateUrl: './contacts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsComponent {
  readonly #store = inject(Store);
  readonly #queryParamsService = inject(QueryParamsService);

  onPaginationChange(event: IPagination): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_PAGINATION_KEY);
    this.#store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  onSortChange(event: ISort): void {
    this.#store.dispatch([new SetCatalogSort(event), new FetchCatalog()]);
  }
}
