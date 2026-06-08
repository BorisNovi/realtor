import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { filter, map, switchMap, take } from 'rxjs';
import { AuthState } from '../state';

export const authGuard: CanActivateFn = (route, state) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return inject(Router).createUrlTree(['/']);

  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.initialized).pipe(
    filter(initialized => initialized),
    take(1),
    switchMap(() => store.select(AuthState.isAuthenticated).pipe(take(1))),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/']);
        return false;
      }
      return true;
    }),
  );
};
