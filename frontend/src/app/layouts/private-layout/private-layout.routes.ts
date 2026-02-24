import { Routes } from '@angular/router';
import { catalogRoutes, contactsResolver } from 'src/app/features';
import { listingsRoutes } from 'src/app/features/listings';
import { PrivateLayoutComponent } from './private-layout.component';
import { profileResolver } from 'src/app/features/profile/profile.resolver';

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
      ...catalogRoutes,
      ...listingsRoutes,
      {
        path: 'contacts',
        title: 'Contacts',
        resolve: { data: contactsResolver },
        loadComponent: () => import('../../features').then(c => c.ContactsComponent),
      },
      {
        path: 'profile',
        title: 'Profile',
        resolve: { data: profileResolver },
        loadComponent: () => import('../../features').then(c => c.ProfileComponent),
      },
    ],
  },
];
