import { Routes } from '@angular/router';
import { catalogRoutes, contactsResolver, listingsResolver } from 'src/app/features';
import { PrivateLayoutComponent } from './private-layout.component';

export const privateLayoutRoutes: Routes = [
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'catalog',
      },
      { path: 'catalog', title: 'Catalog', children: catalogRoutes },
      {
        path: 'listings',
        title: 'Listings',
        resolve: { data: listingsResolver },
        loadComponent: () => import('../../features').then(c => c.ListingsComponent),
      },
      {
        path: 'contacts',
        title: 'Contacts',
        resolve: { data: contactsResolver },
        loadComponent: () => import('../../features').then(c => c.ContactsComponent),
      },
      {
        path: 'profile',
        title: 'Profile',
        loadComponent: () => import('../../features').then(c => c.ProfileComponent),
      },
    ],
  },
];
