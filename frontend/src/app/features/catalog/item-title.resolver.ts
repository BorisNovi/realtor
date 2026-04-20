import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { filter, map, take } from 'rxjs';
import { CatalogState } from 'src/app/core';

export const itemTitleResolver: ResolveFn<string> = route => {
  const store = inject(Store);
  const id = +route.params['id'];

  return store.select(CatalogState.propertyObject).pipe(
    filter(obj => obj !== null && obj.id === id),
    take(1),
    map(obj => obj!.name),
  );
};
