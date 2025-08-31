import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { QueryParamsService } from 'src/app/core';

export const contactsResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const queryParamsService = inject(QueryParamsService);
  const store = inject(Store);
  const router = inject(Router);
  return of();
  // return combineLatest([store.select(CatalogState.pagination), store.select(CatalogState.filters)]).pipe(
  //   take(1),
  //   switchMap(([pagination, filters]) => {
  //     const currentQueryParams = route.queryParams;
  //     const paginationFromQuery = queryParamsService.parseQueryParams(currentQueryParams, CATALOG_PAGINATION_KEY);
  //     const filtersFromQuery = queryParamsService.parseQueryParams(currentQueryParams, CATALOG_FILTERS_KEY);

  //     const newQueryParams = {
  //       ...queryParamsService.buildQueryParams(pagination, CATALOG_PAGINATION_KEY),
  //       ...queryParamsService.buildQueryParams(filters, CATALOG_FILTERS_KEY),
  //     };

  //     if (!Object.keys(paginationFromQuery).length) {
  //       router.navigate([''], {
  //         queryParams: newQueryParams,
  //         queryParamsHandling: 'merge',
  //         replaceUrl: false,
  //       });
  //     }

  //     return store.dispatch([
  //       new SetCatalogPagination(paginationFromQuery),
  //       new SetCatalogFilters(filtersFromQuery),
  //       new FetchCatalog(),
  //     ]);
  //   }),
  //   map(() => true),
  // );
};
