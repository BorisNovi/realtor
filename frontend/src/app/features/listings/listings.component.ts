import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@shared/components';
import { ICatalogFilters, IContact, IFetchOptions, IPagination, ISort } from '@shared/interfaces';
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
  fetchMethod = (options: IFetchOptions) => this.contactsService.fetchContacts(options);
  mapToSelect = (item: IContact) => ({ label: `${item.name} (${item.phone})`, value: item });
}
