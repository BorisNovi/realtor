import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { SignInComponent, SignUpComponent, ForgotComponent, RecoveryComponent, WidthTesterComponent } from './components';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sign-in',
      },
      { path: 'sign-in', component: SignInComponent, title: 'Sign in' },
      { path: 'sign-up', component: SignUpComponent, title: 'Sign up' },
      { path: 'forgot', component: ForgotComponent, title: 'Forogot password' },
      { path: 'recovery', component: RecoveryComponent, title: 'New password' },
      { path: 'w', component: WidthTesterComponent, title: 'Width test' },
      { path: '**', redirectTo: 'sign-in' },
    ],
  },
];
