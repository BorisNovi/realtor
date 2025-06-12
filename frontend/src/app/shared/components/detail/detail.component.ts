import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IPropertyObject } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-detail',
  imports: [ButtonModule, GalleriaModule, ImageModule],
  templateUrl: './detail.component.html',
})
export class DetailComponent {
  readonly propertyObject = input<IPropertyObject>();

  images: any[] = [
    { image: 'https://picsum.photos/id/237/1200/1000', thumbnail: 'https://picsum.photos/id/237/100/100' },
    { image: 'https://picsum.photos/id/238/1200/1000', thumbnail: 'https://picsum.photos/id/238/100/100' },
    { image: 'https://picsum.photos/id/239/1200/1000', thumbnail: 'https://picsum.photos/id/239/100/100' },
    { image: 'https://picsum.photos/id/240/1200/1000', thumbnail: 'https://picsum.photos/id/240/100/100' },
    { image: 'https://picsum.photos/id/241/1200/1000', thumbnail: 'https://picsum.photos/id/241/100/100' },
    { image: 'https://picsum.photos/id/242/1200/1000', thumbnail: 'https://picsum.photos/id/242/100/100' },
  ];

  galleriaResponsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '960px',
      numVisible: 4,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 2,
    },
  ];
}
