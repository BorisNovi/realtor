import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
// import { SocketService } from '@app/core/services';
import { AuthState } from '../state';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthSocketSyncService {
  readonly #store = inject(Store);
  // #socketService = inject(SocketService);

  syncSocketWithAuth() {
    combineLatest([this.#store.select(AuthState.user), this.#store.select(AuthState.accessToken)])
      .pipe(
        filter(([user, token]) => !!user && !!token),
        map(([user, token]) => ({ user, token })),
      )
      .subscribe(() => {
        // this.#socketService.connect(user, token);
      });
  }
}
