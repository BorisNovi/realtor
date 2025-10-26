import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class DeletionConfirmationService {
  readonly #confirmationService = inject(ConfirmationService);
  readonly #translateService = inject(TranslateService);

  confirm(onAccept: () => void): void {
    this.#confirmationService.confirm({
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
        onAccept();
      },
    });
  }
}
