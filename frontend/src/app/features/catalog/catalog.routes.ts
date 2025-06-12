import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog.component';
import { catalogResolver } from './catalog.resolver';
import { CatalogItemComponent } from './components/catalog-item/catalog-item.component';

export const catalogRoutes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    resolve: { data: catalogResolver },
  },
  {
    path: ':id',
    component: CatalogItemComponent,
  },
];
