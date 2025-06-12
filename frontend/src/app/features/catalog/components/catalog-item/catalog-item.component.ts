import { Component } from '@angular/core';
import { DetailComponent } from '@shared/components';

@Component({
  selector: 'app-catalog-item',
  imports: [DetailComponent],
  templateUrl: './catalog-item.component.html',
})
export class CatalogItemComponent {}
