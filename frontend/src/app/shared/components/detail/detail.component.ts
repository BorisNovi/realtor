import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IPropertyObject } from '@shared/interfaces';
import { WorldPhoneMaskPipe } from '@shared/pipes';
import { getPropertyStatusSeverity } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule, GalleriaResponsiveOptions } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'rx-detail',
  imports: [ButtonModule, GalleriaModule, ImageModule, TagModule, TranslatePipe, WorldPhoneMaskPipe],
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
})
export class DetailComponent {
  readonly propertyObject = input<IPropertyObject>();

  readonly getSeverity = getPropertyStatusSeverity;

  images: Record<string, string>[] = [
    { image: 'https://picsum.photos/id/238/1200/1000', thumbnail: 'https://picsum.photos/id/238/100/100' },
    { image: 'https://picsum.photos/id/237/1200/1000', thumbnail: 'https://picsum.photos/id/237/100/100' },
    { image: 'https://picsum.photos/id/239/1200/1000', thumbnail: 'https://picsum.photos/id/239/100/100' },
    { image: 'https://picsum.photos/id/240/1200/1000', thumbnail: 'https://picsum.photos/id/240/100/100' },
    { image: 'https://picsum.photos/id/241/1200/1000', thumbnail: 'https://picsum.photos/id/241/100/100' },
    { image: 'https://picsum.photos/id/242/1200/1000', thumbnail: 'https://picsum.photos/id/242/100/100' },
  ];

  galleriaResponsiveOptions: GalleriaResponsiveOptions[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '960px',
      numVisible: 4,
    },
  ];
}
