import { Routes } from '@angular/router';
import { authGuard, loggedInGuard } from './core';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./layouts').then(c => c.privateLayoutRoutes),
  },
  {
    path: 'public',
    canActivate: [],
    loadChildren: () => import('./layouts').then(c => c.publicLayoutRoutes),
  },
  {
    path: 'auth',
    canActivate: [loggedInGuard],
    loadChildren: () => import('./features').then(c => c.authRoutes),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent),
  },
];
