import { Routes } from '@angular/router';
import { NotFoundComponent } from './features';

export const routes: Routes = [
  {
    path: 'auth',
    // canActivate: [loginGuard],
    loadChildren: () => import('./features').then((c) => c.authRoutes),
  },
  {
    path: '',
    // canActivate: [authenticatedGuard],
    loadChildren: () => import('./layouts').then((c) => c.privateLayoutRoutes),
  },
  { path: '**', component: NotFoundComponent },
];
