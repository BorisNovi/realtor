import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { IPropertyObject } from '@shared/interfaces';
import { CamelToUpperSnakePipe, NotEmptyPipe, WorldPhoneMaskPipe } from '@shared/pipes';
import { getPropertyStatusSeverity } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule, GalleriaResponsiveOptions } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { StaticMapComponent } from '../static-map/static-map.component';

@Component({
  selector: 'rx-detail',
  imports: [
    ButtonModule,
    GalleriaModule,
    ImageModule,
    TagModule,
    TranslatePipe,
    WorldPhoneMaskPipe,
    CamelToUpperSnakePipe,
    NotEmptyPipe,
    StaticMapComponent,
  ],
  styles: `
    ::ng-deep {
      p-galleria .p-galleria {
        border-color: transparent !important;
      }
    }
    .card {
      margin-bottom: 1rem;
    }
  `,
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent {
  readonly propertyObject = input<IPropertyObject>();

  readonly getSeverity = getPropertyStatusSeverity;

  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  readonly galleriaResponsiveOptions: GalleriaResponsiveOptions[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '960px',
      numVisible: 4,
    },
  ];

  readonly optionsArray = computed(() => {
    const options = this.propertyObject()?.specifics?.options;
    if (!options) return [];

    return Object.entries(options)
      .map(([category, values]) => ({
        category,
        values: Object.entries(values as Record<string, boolean>).filter(opt => opt[1]),
      }))
      .filter(group => group.values.length > 0);
  });

  // TODO: Помтом убрать. Сделанно временно, пока с бэка не возвращаются фото в { image: string; thumbnail: string; }[]
  readonly imagesTemp = computed(() => this.propertyObject()?.photos.map(p => ({ image: p, thumbnail: p })));
}
