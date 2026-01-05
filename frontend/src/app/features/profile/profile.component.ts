import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { AuthState, Logout, Terminate } from 'src/app/core';
import { ChangePassword } from 'src/app/core/profile/state';

@Component({
  selector: 'rx-profile',
  imports: [InputTextModule, FluidModule, ButtonModule, FormsModule, DividerModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);

  readonly user = this.#store.selectSignal(AuthState.user); // TODO: Заменить на юзера из профиля

  logOut(): void {
    this.#store.dispatch(new Logout());
  }

  terminate(): void {
    this.#store.dispatch(new Terminate());
  }

  changePassword() {
    this.#store.dispatch(new ChangePassword('abc', 'def')).pipe(takeUntilDestroyed(this.#destroyRef)).subscribe();
  }
}
