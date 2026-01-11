import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, map, of } from 'rxjs';
import { FetchListing } from 'src/app/core/listings/state';

export const publicListingResolver: ResolveFn<boolean> = (route, state) => {
  const store = inject(Store);
  // TODO: потом заменить диспатч на то, что будет создано для публичной подборки
  const token = route.queryParams['token'];
  const router = inject(Router);

  return store.dispatch(new FetchListing(route.queryParams['token'])).pipe(
    map(() => true),
    catchError(err => {
      console.error('Listing request failed:', err);
      router.navigate(['/not-found']);
      return of(false);
    }),
  );
};
