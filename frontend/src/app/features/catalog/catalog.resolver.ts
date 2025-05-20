import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { CatalogState, FetchCatalog, QueryParamsService, SetCatalogPagination } from 'src/app/core';
import { map, switchMap, take } from 'rxjs/operators';
import { CATALOG_PAGINATION_KEY } from '@shared/constants';

export const catalogResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const queryParamsService = inject(QueryParamsService);
  const store = inject(Store);
  const router = inject(Router);

  return store.select(CatalogState.pagination).pipe(
    take(1),
    switchMap(pagination => {
      const currentQueryParams = route.queryParams;
      const paginationFromQuery = queryParamsService.parseQueryParams(currentQueryParams, CATALOG_PAGINATION_KEY);

      const newQueryParams = {
        // ...currentQueryParams,
        [CATALOG_PAGINATION_KEY + '.first']: pagination.first,
        [CATALOG_PAGINATION_KEY + '.rows']: pagination.rows,
      };

      if (!Object.keys(paginationFromQuery).length) {
        console.log('query doesnt have pagination', pagination);

        router.navigate([''], {
          queryParams: newQueryParams,
          queryParamsHandling: 'merge',
          replaceUrl: false,
        });
      }

      // TODO: то же, что ты написал для пагинации, напиши и для фильтров
      return store.dispatch([new SetCatalogPagination(paginationFromQuery), new FetchCatalog()]);
    }),
    map(() => true),
  );
};
