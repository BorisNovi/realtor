import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IAddress } from '@shared/interfaces';
import { MapHelper } from '@shared/utils/map-helper.util';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'rx-address-link',
  imports: [ButtonModule, TooltipModule, TranslatePipe],
  template: `<a
    pButton
    [rounded]="true"
    [text]="true"
    [pTooltip]="'MAP.SHOW_ON_MAP' | translate"
    [href]="externalLink()"
    target="_blank"
    icon="pi pi-map-marker"
  ></a>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressLinkComponent {
  readonly address = input.required<IAddress>();

  readonly externalLink = computed(() => {
    const addr = this.address();
    const addressParts = [addr.country, addr.state, addr.city, addr.road, addr.house].filter(Boolean);
    const addressStr = addressParts.join(',');

    if (addr?.position) {
      const { lng, lat } = MapHelper.normalizeLngLat(addr.position);
      return `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},${MapHelper.ZOOM_STREET}z`;
    }

    return `https://www.google.com/maps/search/${addressStr}`;
  });
}
