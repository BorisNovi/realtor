import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { LISTINGS_PAGINATION_KEY } from '@shared/constants';
import { map, switchMap, take } from 'rxjs';
import { QueryParamsService } from 'src/app/core';
import { FetchListings, ListingsState, SetListingsPagination } from 'src/app/core/listings/state';

export const listingsResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const queryParamsService = inject(QueryParamsService);
  const store = inject(Store);
  const router = inject(Router);
  return store.select(ListingsState.pagination).pipe(
    take(1),
    switchMap(pagination => {
      const currentQueryParams = route.queryParams;
      const paginationFromQuery = queryParamsService.parseQueryParams(currentQueryParams, LISTINGS_PAGINATION_KEY);

      const newQueryParams = {
        ...queryParamsService.buildQueryParams(pagination, LISTINGS_PAGINATION_KEY),
      };

      if (!Object.keys(paginationFromQuery).length) {
        router.navigate(['/listings'], {
          queryParams: newQueryParams,
          replaceUrl: false,
        });
      }

      return store.dispatch([new SetListingsPagination(paginationFromQuery), new FetchListings()]);
    }),
    map(() => true),
  );
};
