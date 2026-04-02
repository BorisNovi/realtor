import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { DetailComponent, LinkSwitchComponent, SelectComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { ICatalogItem, IFetchOptions } from '@shared/interfaces';
import { NotEmptyPipe, WorldPhoneMaskPipe } from '@shared/pipes';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Popover, PopoverModule } from 'primeng/popover';
import { map } from 'rxjs';
import { CatalogService, DeletionConfirmationService } from 'src/app/core';
import { ChangeListingAvaliability, DeleteListing, ListingsState, UpdateListing } from 'src/app/core/listings/state';

@Component({
  selector: 'rx-catalog-item',
  imports: [
    FormsModule,
    DetailComponent,
    Divider,
    Button,
    TranslatePipe,
    ConfirmDialog,
    NotEmptyPipe,
    PopoverModule,
    SelectComponent,
    LinkSwitchComponent,
    WorldPhoneMaskPipe,
  ],
  animations: [SLIDE],
  templateUrl: './listing-item.component.html',
  styleUrl: './listing-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingItemComponent implements OnDestroy {
  readonly #store = inject(Store);
  readonly #translateService = inject(TranslateService);
  readonly #catalogService = inject(CatalogService);
  readonly #router = inject(Router);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly #route = inject(ActivatedRoute);

  readonly mode = toSignal(this.#route.data.pipe(map(data => data['mode'] || Mode.Edit)));

  readonly objectsSelector = viewChild<Popover>('objectsSelector');

  readonly objectSelectShown = signal(false);

  readonly item = this.#store.selectSignal(ListingsState.listing);
  readonly loading = this.#store.selectSignal(ListingsState.loading);

  readonly catalogFetchMethod = (options: IFetchOptions) => this.#catalogService.fetchCatalog(options);
  readonly catalogMapToSelect = (item: ICatalogItem) => ({
    label: `
      ${this.#translateService.instant('FORM.PROPERTIES.PROPERTY_TYPE.' + item?.propertyType)}
      ${item?.address?.city} ${item?.area} m² —
      ${item?.price?.value}
      ${this.getCurrencySymbol(item?.price?.currency)}
    `,
    value: item,
    id: item.id,
  });

  Mode = Mode;
  #ref!: DynamicDialogRef | null;

  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  deleteListing(): void {
    this.#deletionConfirmationService.confirm(
      () => {
        this.#store.dispatch(new DeleteListing([this.item()?.id || 0]));
        this.#router.navigate(['/app/listings']);
      },
      { header: 'LISTINGS.DIALOG.DELETE_REQUEST_SINGLE' },
    );
  }

  deleteItem(id: number): void {
    const listing = this.item();
    if (!listing || this.loading()) return;
    const ids = listing?.propertyObjectIds.filter(objectId => objectId !== id);
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new UpdateListing({ ...listing, propertyObjectIds: ids }, { getList: false }));
    });
  }

  openObjectsSelector(event: Event): void {
    this.objectsSelector()?.toggle(event);
  }

  onObjectClick(event: any): void {
    const id = event.value.id;
    const listing = this.item();
    if (!listing || this.loading()) return;

    const ids = listing.propertyObjectIds ?? [];
    if (ids.includes(id)) return;

    this.#store.dispatch(new UpdateListing({ ...listing, propertyObjectIds: [...ids, id] }, { getList: false }));
  }

  changeAvaliability(available: boolean | undefined): void {
    this.#store.dispatch(new ChangeListingAvaliability(this.item()!.id, { available: available ?? false }));
  }

  ngOnDestroy(): void {
    if (this.#ref) {
      this.#ref.close();
    }
  }
}

export enum Mode {
  Edit = 'edit',
  Share = 'share',
}
