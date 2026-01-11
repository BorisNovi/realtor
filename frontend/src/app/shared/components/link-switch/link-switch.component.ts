import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IPublicLink } from '@shared/interfaces/listing.interface';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToggleButton } from 'primeng/togglebutton';

@Component({
  selector: 'rx-link-switch',
  imports: [FormsModule, InputGroup, InputGroupAddonModule, Button, TranslatePipe, ToggleButton],
  providers: [DialogService],
  templateUrl: 'link-switch.component.html',
  styles: `
    :host {
      ::ng-deep {
        .p-togglebutton {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkSwitchComponent {
  readonly publicLink = model<IPublicLink | null>();
  readonly disabled = input<boolean>(false);

  readonly #translateService = inject(TranslateService);
  readonly #messageService = inject(MessageService);

  readonly linkAvailable = linkedSignal(() => this.publicLink()?.available);

  copyLink(): void {
    const publicLink = this.publicLink();
    if (!publicLink || !publicLink?.token) return;

    navigator.clipboard.writeText(`${window.location.origin}/public/listings/?token=${this.publicLink()?.token}` || '');

    this.#messageService.add({
      severity: 'success',
      summary: this.#translateService.instant('NOTIFICATIONS.SUCCESS'),
      detail: this.#translateService.instant('LISTINGS.NOTIFICATION.LINK_COPIED'),
      life: 3000,
    });
  }
}
