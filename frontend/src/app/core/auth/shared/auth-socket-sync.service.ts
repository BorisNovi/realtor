import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
// import { SocketService } from '@app/core/services';
import { AuthState } from '../state';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthSocketSyncService {
  private store = inject(Store);
  // private socketService = inject(SocketService);

  public syncSocketWithAuth() {
    combineLatest([this.store.select(AuthState.user), this.store.select(AuthState.accessToken)])
      .pipe(
        filter(([user, token]) => !!user && !!token),
        map(([user, token]) => ({ user, token })),
      )
      .subscribe(({ user, token }) => {
        console.log('Сейчас мы должны были вызывать connetc у сокет сервис с ', user, token);
        // this.socketService.connect(user, token);
      });
  }
}
