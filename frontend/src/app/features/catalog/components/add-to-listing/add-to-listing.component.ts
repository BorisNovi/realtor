import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { RxSelectItem, SelectComponent } from '@shared/components';
import { IFetchOptions, IListing } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogModule } from 'primeng/dynamicdialog';
import { Tooltip } from 'primeng/tooltip';
import { first } from 'rxjs';
import { ListingsService } from 'src/app/core/listings';
import { ListingsState, UpdateListing } from 'src/app/core/listings/state';
import { CreateListingComponent } from 'src/app/features/listings/components/create-listing/create-listing.component';

@Component({
  imports: [ButtonModule, SelectComponent, Tooltip, TranslatePipe, DynamicDialogModule],
  providers: [DialogService],
  templateUrl: 'add-to-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToListingComponent {
  readonly config = inject(DynamicDialogConfig);
  readonly #store = inject(Store);
  readonly #listingsService = inject(ListingsService);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);

  protected readonly select = viewChild.required(SelectComponent);

  readonly #listingLoading = this.#store.selectSignal(ListingsState.loading);

  readonly listingsAlreadyHasObject = signal<number[]>([]);

  readonly disableListingWhithCurrentObject = (item: RxSelectItem) =>
    item.value.propertyObjectIds.includes(this.config.data ?? -1);
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

  openCreateListingDialog(): void {
    const ref = this.#dialogService.open(CreateListingComponent, {
      header: this.#translateService.instant('LISTINGS.DIALOG.ADD'),
      width: '620px',
      modal: true,
      closable: true,
      dismissableMask: true,
      draggable: false,
      contentStyle: { overflow: 'auto' },
      breakpoints: { '640px': '90vw' },
    });

    ref?.onClose.pipe(first()).subscribe(() => this.select().reload());
  }
}
