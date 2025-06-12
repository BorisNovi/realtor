import { Routes } from '@angular/router';
import { catalogRoutes } from 'src/app/features';
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
      { path: 'catalog', children: catalogRoutes },
      { path: 'listings', loadComponent: () => import('../../features').then(c => c.ListingsComponent) },
      { path: 'map', loadComponent: () => import('../../features').then(c => c.MapComponent) },
      {
        path: 'profile',
        loadComponent: () => import('../../features').then(c => c.ProfileComponent),
      },
    ],
  },
];
