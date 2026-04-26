import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { map } from 'rxjs';
import { FetchListing } from 'src/app/core';

export const listingResolver: ResolveFn<boolean> = (route, state) => {
  const store = inject(Store);
  return store.dispatch(new FetchListing(+route.params?.['id'])).pipe(map(() => true));
};
