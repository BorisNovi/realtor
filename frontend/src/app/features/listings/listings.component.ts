import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@shared/components';
import { ICatalogFilters, IContact, IPagination, ISort } from '@shared/interfaces';
import { ContactsService } from 'src/app/core';

@Component({
  selector: 'rx-listings',
  imports: [SelectComponent],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsComponent {
  readonly contactsService = inject(ContactsService);
  fetchMethod = (search: string | null, filters: any, pagination: IPagination, sort: ISort | null) =>
    this.contactsService.fetchContacts(search, filters, pagination, sort);
  mapToSelect = (item: IContact) => ({ label: item.name, value: item });
}
