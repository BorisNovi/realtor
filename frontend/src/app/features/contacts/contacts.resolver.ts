import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { CONTACTS_PAGINATION_KEY } from '@shared/constants';
import { map, switchMap, take } from 'rxjs';
import { ContactsState, FetchContacts, QueryParamsService, SetContactsPagination } from 'src/app/core';

export const contactsResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const queryParamsService = inject(QueryParamsService);
  const store = inject(Store);
  const router = inject(Router);
  return store.select(ContactsState.pagination).pipe(
    take(1),
    switchMap(pagination => {
      const currentQueryParams = route.queryParams;
      const paginationFromQuery = queryParamsService.parseQueryParams(currentQueryParams, CONTACTS_PAGINATION_KEY);

      const newQueryParams = {
        ...queryParamsService.buildQueryParams(pagination, CONTACTS_PAGINATION_KEY),
      };

      if (!Object.keys(paginationFromQuery).length) {
        router.navigate(['/app/contacts'], {
          queryParams: newQueryParams,
          replaceUrl: false,
        });
      }

      return store.dispatch([new SetContactsPagination(paginationFromQuery), new FetchContacts()]);
    }),
    map(() => true),
  );
};
