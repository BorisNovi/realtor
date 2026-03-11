import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, map, of } from 'rxjs';
import { FetchProfile } from 'src/app/core/profile/state';

export const profileResolver: ResolveFn<boolean> = () => {
  const store = inject(Store);

  return store.dispatch(new FetchProfile()).pipe(
    map(() => true),
    catchError(err => {
      console.error('Profile request failed:', err);
      return of(false);
    }),
  );
};
