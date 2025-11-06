import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class DeletionConfirmationService {
  readonly #confirmationService = inject(ConfirmationService);
  readonly #translateService = inject(TranslateService);

  confirm(onAccept: () => void, options?: IDeletionConfirmationOptions): void {
    this.#confirmationService.confirm({
      message: this.#translateService.instant(options?.message || 'CATALOG.TABLE.DIALOG.DELETE_HINT'),
      header: this.#translateService.instant(options?.header || 'CATALOG.TABLE.DIALOG.DELETE_REQUEST_SINGLE'),
      icon: 'pi pi-info-circle',

      rejectButtonProps: {
        label: this.#translateService.instant('ACTIONS.CANCEL'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.#translateService.instant('ACTIONS.DELETE'),
        severity: 'danger',
      },

      accept: () => {
        onAccept();
      },
    });
  }
}

interface IDeletionConfirmationOptions {
  message?: string;
  header?: string;
}
