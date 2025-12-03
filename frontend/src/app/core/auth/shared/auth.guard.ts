import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isAuthenticated).pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/public']);
        return false;
      }
      return true;
    }),
  );
};
