import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { DetailComponent } from '@shared/components';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { CatalogState } from 'src/app/core';

@Component({
  selector: 'app-catalog-item',
  imports: [DetailComponent, Divider, Button, TranslatePipe, BreadcrumbModule],
  styles: `
    ::ng-deep {
      p-breadcrumb .p-breadcrumb {
        background-color: transparent;
      }
    }
  `,
  templateUrl: './catalog-item.component.html',
})
export class CatalogItemComponent {
  readonly #store = inject(Store);
  readonly item = this.#store.selectSignal(CatalogState.propertyObject);
}
