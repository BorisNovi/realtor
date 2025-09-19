import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { CONTACTS_PAGINATION_KEY } from '@shared/constants';
import { IPagination, ISort } from '@shared/interfaces';
import { FetchContacts, QueryParamsService, SetContactsPagination, SetContactsSort } from 'src/app/core';
import { ContactsTableComponent } from './components/contacts-table/contacts-table.component';

@Component({
  selector: 'rx-contacts',
  imports: [ContactsTableComponent],
  templateUrl: './contacts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsComponent {
  readonly #store = inject(Store);
  readonly #queryParamsService = inject(QueryParamsService);

  onPaginationChange(event: IPagination): void {
    this.#queryParamsService.updateQueryParams(event, CONTACTS_PAGINATION_KEY);
    this.#store.dispatch([new SetContactsPagination(event), new FetchContacts()]);
  }

  onSortChange(event: ISort): void {
    this.#store.dispatch([
      new SetContactsSort(event),
      new FetchContacts(),
    ]);
  }
}
