import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { DetailComponent } from '@shared/components';
import { ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Divider } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CatalogState, DeletePropertyObjects } from 'src/app/core';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';

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
  templateUrl: './catalog-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogItemComponent implements OnDestroy {
  readonly #store = inject(Store);
  readonly #dialogService = inject(DialogService);
  readonly #confirmationService = inject(ConfirmationService);
  readonly #translateService = inject(TranslateService);
  readonly #router = inject(Router);
  readonly item = this.#store.selectSignal(CatalogState.propertyObject);

  #ref: DynamicDialogRef | undefined;

  confirmDeletion(event: Event): void {
    this.#confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.#translateService.instant('CATALOG.TABLE.DIALOG.DELETE_HINT'),
      header: this.#translateService.instant('CATALOG.TABLE.DIALOG.DELETE_REQUEST_SINGLE'),
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: this.#translateService.instant('CATALOG.TABLE.DIALOG.CANCEL'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.#translateService.instant('CATALOG.TABLE.ACTIONS.DELETE'),
        severity: 'danger',
      },

      accept: () => {
        this.#store.dispatch(new DeletePropertyObjects([this.item()?.id || 0]));
        this.#router.navigate(['/']);
      },
    });
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
