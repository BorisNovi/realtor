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
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'forgot', component: ForgotComponent },
      { path: 'recovery', component: RecoveryComponent },
      { path: 'w', component: WidthTesterComponent },
      { path: '**', redirectTo: 'sign-in' },
    ],
  },
];
