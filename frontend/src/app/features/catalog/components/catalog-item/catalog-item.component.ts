import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { DetailComponent, RxSelectItem, SelectComponent } from '@shared/components';
import { IFetchOptions, IListing } from '@shared/interfaces';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Popover, PopoverModule } from 'primeng/popover';
import { first } from 'rxjs';
import { CatalogState, DeletePropertyObjects, DeletionConfirmationService } from 'src/app/core';
import { ListingsService } from 'src/app/core/listings';
import { ListingsState, UpdateListing } from 'src/app/core/listings/state';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';

@Component({
  selector: 'rx-catalog-item',
  imports: [DetailComponent, Divider, Button, TranslatePipe, BreadcrumbModule, ConfirmDialog, PopoverModule, SelectComponent],
  providers: [DialogService],
  styles: `
    :host {
      ::ng-deep {
        p-breadcrumb .p-breadcrumb {
          background-color: transparent;
        }
      }
    }
  `,
  templateUrl: './catalog-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogItemComponent implements OnDestroy {
  readonly #store = inject(Store);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);
  readonly #listingsService = inject(ListingsService);
  readonly #router = inject(Router);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);

  readonly #listingLoading = this.#store.selectSignal(ListingsState.loading);
  readonly item = this.#store.selectSignal(CatalogState.propertyObject);

  #ref!: DynamicDialogRef | null;

  readonly listingsAlreadyHasObject = signal<number[]>([]);

  readonly listingsFetchMethod = (options: IFetchOptions) => this.#listingsService.fetchListings(options);
  readonly lisitingsMapToSelect = (item: IListing) => ({
    label: `${item.name}`,
    value: item,
    id: item.id,
  });

  readonly listingSelectShown = signal(false);
  readonly listingsSelector = viewChild<Popover>('listingsSelector');

  disableListingWhithCurrentObject = (item: RxSelectItem) => item.value.propertyObjectIds.includes(this.item()?.id ?? -1);

  deleteItem(): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new DeletePropertyObjects([this.item()?.id || 0]));
      this.#router.navigate(['/']);
    });
  }

  openListingsSelector(event: Event): void {
    this.listingsSelector()?.toggle(event);
  }

  onListingClick(event: any): void {
    const listing = event.value as IListing;
    const objectId = this.item()?.id;
    if (!objectId || this.#listingLoading()) return;

    this.#store
      .dispatch(
        new UpdateListing({ ...listing, propertyObjectIds: [...listing.propertyObjectIds, objectId] }, { getList: false }),
      )
      .pipe(first())
      .subscribe(() => this.listingsAlreadyHasObject.update(arr => (arr = [...arr, listing.id])));
  }

  openEditDialog(): void {
    this.#ref = this.#dialogService.open(CreateCatalogItemComponent, {
      data: this.item(),
      header: this.#translateService.instant('CATALOG.TABLE.DIALOG.EDIT'),
      width: '50vw',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      focusOnShow: false,
      breakpoints: {
        '960px': '75vw',
        '768px': '90vw',
        '640px': '95vw',
      },
    });
  }

  ngOnDestroy(): void {
    if (this.#ref) {
      this.#ref.close();
    }
  }
}
