import { Routes } from '@angular/router';
import { PrivateLayoutComponent } from './private-layout.component';
import { CatalogComponent } from '../../features';

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
      { path: 'catalog', component: CatalogComponent },
      {
        path: 'profile',
        loadComponent: () => import('../../features/profile/profile.component').then(c => c.ProfileComponent),
      },
      { path: '**', redirectTo: 'catalog' },
    ],
  },
];
