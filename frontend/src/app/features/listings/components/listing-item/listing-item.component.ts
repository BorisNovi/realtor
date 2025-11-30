import { ChangeDetectionStrategy, Component, inject, linkedSignal, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { DetailComponent } from '@shared/components';
import { NotEmptyPipe } from '@shared/pipes';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToggleButton } from 'primeng/togglebutton';
import { DeletionConfirmationService } from 'src/app/core';
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
  readonly #router = inject(Router);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);

  readonly mode = signal<Mode>(Mode.Edit);

  readonly item = this.#store.selectSignal(ListingsState.listing);
  readonly linkAvailable = linkedSignal(() => this.item()?.publicLink);

  Mode = Mode;
  #ref!: DynamicDialogRef | null;

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

  openAddDialog(): void {
    // TODO: добавление недвижимости в подборку
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
