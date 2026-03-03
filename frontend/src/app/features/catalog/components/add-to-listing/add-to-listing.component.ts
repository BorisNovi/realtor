import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { RxSelectItem, SelectComponent } from '@shared/components';
import { IFetchOptions, IListing } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { first } from 'rxjs';
import { ListingsService } from 'src/app/core/listings';
import { ListingsState, UpdateListing } from 'src/app/core/listings/state';
import { TranslatePipe } from '@ngx-translate/core';
import { Tooltip } from 'primeng/tooltip';

@Component({
  imports: [ButtonModule, SelectComponent, Tooltip, TranslatePipe],
  templateUrl: 'add-to-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToListingComponent {
  readonly #ref = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly #store = inject(Store);
  readonly #listingsService = inject(ListingsService);

  readonly #listingLoading = this.#store.selectSignal(ListingsState.loading);

  readonly listingsAlreadyHasObject = signal<number[]>([]);

  disableListingWhithCurrentObject = (item: RxSelectItem) => item.value.propertyObjectIds.includes(this.config.data ?? -1);
  readonly listingsFetchMethod = (options: IFetchOptions) => this.#listingsService.fetchListings(options);
  readonly lisitingsMapToSelect = (item: IListing) => ({
    label: `${item.name}`,
    value: item,
    id: item.id,
  });

  onListingClick(event: any): void {
    const listing = event.value as IListing;
    const objectId = this.config.data as number;
    if (!objectId || this.#listingLoading()) return;

    this.#store
      .dispatch(
        new UpdateListing({ ...listing, propertyObjectIds: [...listing.propertyObjectIds, objectId] }, { getList: false }),
      )
      .pipe(first())
      .subscribe(() => this.listingsAlreadyHasObject.update(arr => (arr = [...arr, listing.id])));
  }

  onCancel(): void {
    this.#ref.close();
  }
}
