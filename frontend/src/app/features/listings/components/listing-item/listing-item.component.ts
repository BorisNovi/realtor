import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { DetailComponent } from '@shared/components';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CatalogState, DeletionConfirmationService } from 'src/app/core';
import { DeleteListing, ListingsState, UpdateListing } from 'src/app/core/listings/state';

@Component({
  selector: 'rx-catalog-item',
  imports: [DetailComponent, Divider, Button, TranslatePipe, BreadcrumbModule, ConfirmDialog],
  providers: [DialogService],
  styles: `
    ::ng-deep {
      p-breadcrumb .p-breadcrumb {
        background-color: transparent;
      }
    }
  `,
  templateUrl: './listing-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingItemComponent implements OnDestroy {
  readonly #store = inject(Store);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);
  readonly #router = inject(Router);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly item = this.#store.selectSignal(ListingsState.listing);

  #ref!: DynamicDialogRef | null;

  deleteListing(): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new DeleteListing([this.item()?.id || 0]));
      this.#router.navigate(['/']);
    });
  }

  deleteItem(id: number): void {
    const listing = this.item();
    if (!listing) return;
    const ids = listing?.propoertyObjectIds.filter(objectId => objectId !== id);
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new UpdateListing({ ...listing, propoertyObjectIds: ids }));
    });
  }

  openAddDialog(): void {
    // TODO: добавление недвижимости в подборку
  }

  ngOnDestroy(): void {
    if (this.#ref) {
      this.#ref.close();
    }
  }
}
