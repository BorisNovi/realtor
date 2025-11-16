import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog.component';
import { catalogResolver } from './catalog.resolver';
import { CatalogItemComponent } from './components/catalog-item/catalog-item.component';
import { CatalogTableComponent } from './components/catalog-table/catalog-table.component';
import { itemResolver } from './item.resolver';

export const catalogRoutes: Routes = [
  {
    path: 'catalog',
    title: 'Catalog',
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
        component: CatalogTableComponent,
      },
      {
        path: 'map',
        loadComponent: () => import('./components/catalog-map/catalog-map.component').then(c => c.CatalogMapComponent),
      },
      {
        path: ':id',
        component: CatalogItemComponent,
        resolve: { data: itemResolver },
      },
    ],
  },
];
