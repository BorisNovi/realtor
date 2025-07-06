import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog.component';
import { catalogResolver } from './catalog.resolver';
import { CatalogItemComponent } from './components/catalog-item/catalog-item.component';
import { CatalogListComponent } from './components/catalog-list/catalog-list.component';
import { CatalogMapComponent } from './components/catalog-map/catalog-map.component';
import { itemResolver } from './item.resolver';

export const catalogRoutes: Routes = [
  {
    path: '',
    component: CatalogComponent,
    resolve: { data: catalogResolver },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: CatalogListComponent,
      },
      {
        path: 'map',
        component: CatalogMapComponent,
      },
    ],
  },
  {
    path: ':id',
    component: CatalogItemComponent,
    resolve: { data: itemResolver },
  },
];
