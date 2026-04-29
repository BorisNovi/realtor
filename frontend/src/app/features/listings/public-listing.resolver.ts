import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, filter, map, of, take, timeout } from 'rxjs';
import { FetchListing, ListingsState } from 'src/app/core';

export const publicListingResolver: ResolveFn<boolean> = (route, state) => {
  const store = inject(Store);
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

export const publicListingTitleResolver: ResolveFn<string> = () => {
  const store = inject(Store);
  return store.select(ListingsState.listing).pipe(
    filter(listing => listing !== null),
    take(1),
    map(listing => listing!.name ?? 'Listings'),
    timeout({ each: 5000, with: () => of('Listings') }),
  );
};
