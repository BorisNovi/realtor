import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CONTACTS_PAGINATION_KEY } from '@shared/constants';
import { IPagination, ISort } from '@shared/interfaces';
import { QueryParamsService } from 'src/app/core';
import { FetchContacts, SetContactsPagination } from 'src/app/core/contacts/state/contacts.actions';
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
    this.#queryParamsService.updateQueryParams(event, CONTACTS_PAGINATION_KEY);
    this.#store.dispatch([new SetContactsPagination(event), new FetchContacts()]);
  }

  onSortChange(event: ISort): void {
    this.#store.dispatch([
      // new SetContactsSort(event),
      new FetchContacts(),
    ]);
  }
}
