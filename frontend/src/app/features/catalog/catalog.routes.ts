import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog.component';
import { catalogResolver } from './catalog.resolver';
import { CatalogItemComponent } from './components/catalog-item/catalog-item.component';
import { itemResolver } from './item.resolver';

export const catalogRoutes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    resolve: { data: catalogResolver },
  },
  {
    path: ':id',
    component: CatalogItemComponent,
    resolve: { data: itemResolver },
  },
];
