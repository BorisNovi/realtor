import { Routes } from '@angular/router';
import { publicListingsRoutes } from 'src/app/features/listings';
import { PublicLayoutComponent } from './public-layout.component';

export const publicLayoutRoutes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'landing',
      },
      ...publicListingsRoutes,
      {
        path: 'landing',
        title: 'Realtor-X',
        loadComponent: () => import('../../features').then(c => c.LandingComponent),
      },
      // {
      //   path: 'policy',
      //   title: 'Policy',
      //   loadComponent: () => import('../../features').then(c => c.PolicyComponent),
      // },
    ],
  },
];
