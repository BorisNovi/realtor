import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return inject(Router).createUrlTree(['/public', 'landing']);

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
