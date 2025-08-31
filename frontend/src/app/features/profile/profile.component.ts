import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { Logout, Terminate } from 'src/app/core';

@Component({
  selector: 'rx-profile',
  imports: [InputTextModule, FluidModule, ButtonModule, FormsModule, DividerModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly #store = inject(Store);

  logOut(): void {
    this.#store.dispatch(new Logout());
  }

  terminate(): void {
    this.#store.dispatch(new Terminate());
  }
}
