import { Routes } from '@angular/router';
import { ListingItemComponent } from './components/listing-item/listing-item.component';
import { ListingsTableComponent } from './components/listings-table/listing-table.component';
import { listingsResolver } from './listings.resolver';

export const listingsRoutes: Routes = [
  {
    path: 'listings',
    title: 'Listings',
    loadComponent: () => import('./listings.component').then(c => c.ListingsComponent),
    resolve: { data: listingsResolver },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: ListingsTableComponent,
      },
      {
        path: ':id',
        component: ListingItemComponent,
        // resolve: { data: listingResolver },
      },
    ],
  },
];
