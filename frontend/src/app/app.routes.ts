import { Routes } from '@angular/router';
import { authGuard, loggedInGuard } from './core';
import { NotFoundComponent } from './features';

export const routes: Routes = [
  {
    path: '',
    // canActivate: [authGuard],
    loadChildren: () => import('./layouts').then(c => c.privateLayoutRoutes),
  },
  {
    path: 'auth',
    // canActivate: [loggedInGuard],
    loadChildren: () => import('./features').then(c => c.authRoutes),
  },
  { path: '**', component: NotFoundComponent },
];
