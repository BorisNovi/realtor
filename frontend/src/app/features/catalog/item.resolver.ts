import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { map } from 'rxjs';
import { FetchPropertyObject } from 'src/app/core';

export const itemResolver: ResolveFn<boolean> = (route, state) => {
  const store = inject(Store);
  return store.dispatch(new FetchPropertyObject(route.params?.['id'])).pipe(map(() => true));
};
