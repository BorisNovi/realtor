import { Routes } from '@angular/router';
import { NotFoundComponent } from './features';
import { authGuard, loggedInGuard } from './core';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [loggedInGuard],
    loadChildren: () => import('./features').then(c => c.authRoutes),
  },
  {
    path: '',
    // canActivate: [authGuard],
    loadChildren: () => import('./layouts').then(c => c.privateLayoutRoutes),
  },
  { path: '**', component: NotFoundComponent },
];
