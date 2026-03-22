import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { ICatalogItem, IPropertyObject } from '@shared/interfaces';
import { CamelToUpperSnakePipe, NotEmptyPipe, WorldPhoneMaskPipe } from '@shared/pipes';
import { getPropertyStatusSeverity } from '@shared/utils/property-status-severity.util';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { GalleriaModule } from 'primeng/galleria';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'rx-catalog-map-drawer',
  imports: [
    DrawerModule,
    ButtonModule,
    TranslatePipe,
    GalleriaModule,
    TagModule,
    DividerModule,
    ProgressBarModule,
    CamelToUpperSnakePipe,
    WorldPhoneMaskPipe,
    NotEmptyPipe,
  ],
  templateUrl: './catalog-map-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogMapDrawerComponent {
  readonly open = input.required<boolean>();
  readonly item = input<ICatalogItem | null>(null);
  readonly detailedItem = input<IPropertyObject | null>(null);

  readonly closed = output<void>();
  readonly deleteRequested = output<number>();
  readonly editRequested = output<number>();
  readonly addToListingRequested = output<number>();

  readonly drawerVisible = signal(false);

  readonly getSeverity = getPropertyStatusSeverity;

  // TODO: Убрать когда с бэка будут возвращаться фото в { image: string; thumbnail: string; }[]
  readonly imagesTemp = computed(() => this.item()?.photos.map(p => ({ image: p, thumbnail: p })));

  readonly optionsArray = computed(() => {
    const options = this.detailedItem()?.specifics?.options;
    if (!options) return [];

    return Object.entries(options)
      .map(([category, values]) => ({
        category,
        values: Object.entries(values as Record<string, boolean>).filter(opt => opt[1]),
      }))
      .filter(group => group.values.length > 0);
  });

  constructor() {
    effect(() => this.drawerVisible.set(this.open()));
  }

  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  onHide(): void {
    this.closed.emit();
  }
}
