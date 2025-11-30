import { Routes } from '@angular/router';
import { ListingItemComponent } from './components/listing-item/listing-item.component';
import { ListingsTableComponent } from './components/listings-table/listing-table.component';
import { listingResolver } from './listing.resolver';
import { listingsResolver } from './listings.resolver';

export const listingsRoutes: Routes = [
  {
    path: 'listings',
    title: 'Listings',
    loadComponent: () => import('./listings.component').then(c => c.ListingsComponent),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        component: ListingsTableComponent,
        resolve: { data: listingsResolver },
      },
      {
        path: ':id',
        component: ListingItemComponent,
        resolve: { data: listingResolver },
      },
    ],
  },
];
