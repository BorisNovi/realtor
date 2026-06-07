import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, map, of } from 'rxjs';
import { FetchProfile } from 'src/app/core';

export const profileResolver: ResolveFn<boolean> = () => {
  const store = inject(Store);

  return store.dispatch(new FetchProfile()).pipe(
    map(() => true),
    catchError(() => of(false)),
  );
};
