import { ChangeDetectionStrategy, Component, inject, linkedSignal, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { DetailComponent, SelectComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { ICatalogItem, IFetchOptions } from '@shared/interfaces';
import { NotEmptyPipe } from '@shared/pipes';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Popover, PopoverModule } from 'primeng/popover';
import { ToggleButton } from 'primeng/togglebutton';
import { CatalogService, DeletionConfirmationService } from 'src/app/core';
import { ChangeListingAvaliability, DeleteListing, ListingsState, UpdateListing } from 'src/app/core/listings/state';

@Component({
  selector: 'rx-catalog-item',
  imports: [
    FormsModule,
    InputGroup,
    InputGroupAddonModule,
    DetailComponent,
    Divider,
    Button,
    TranslatePipe,
    BreadcrumbModule,
    ConfirmDialog,
    NotEmptyPipe,
    ToggleButton,
    PopoverModule,
    SelectComponent,
  ],
  providers: [DialogService],
  animations: [SLIDE],
  templateUrl: './listing-item.component.html',
  styleUrl: './listing-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingItemComponent implements OnDestroy {
  readonly #store = inject(Store);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);
  readonly #messageService = inject(MessageService);
  readonly #catalogService = inject(CatalogService);
  readonly #router = inject(Router);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);

  readonly objectsSelector = viewChild<Popover>('objectsSelector');

  readonly mode = signal<Mode>(Mode.Edit);
  readonly objectSelectShown = signal(false);

  readonly item = this.#store.selectSignal(ListingsState.listing);
  readonly linkAvailable = linkedSignal(() => this.item()?.publicLink?.available);

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
        this.#router.navigate(['/listings']);
      },
      { header: 'LISTINGS.DIALOG.DELETE_REQUEST_SINGLE' },
    );
  }

  deleteItem(id: number): void {
    const listing = this.item();
    if (!listing) return;
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
    if (!listing) return;

    const ids = listing.propertyObjectIds ?? [];
    if (ids.includes(id)) return;

    this.#store.dispatch(new UpdateListing({ ...listing, propertyObjectIds: [...ids, id] }, { getList: false }));
  }

  changeAvaliability(available: boolean | undefined): void {
    this.#store.dispatch(new ChangeListingAvaliability(this.item()!.id, { available: available ?? false }));
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.item()?.publicLink?.url || '');

    this.#messageService.add({
      severity: 'success',
      summary: this.#translateService.instant('NOTIFICATIONS.SUCCESS'),
      detail: this.#translateService.instant('LISTINGS.NOTIFICATION.LINK_COPIED'),
      life: 3000,
    });
  }

  ngOnDestroy(): void {
    if (this.#ref) {
      this.#ref.close();
    }
  }
}

enum Mode {
  Edit = 'edit',
  Share = 'share',
}
