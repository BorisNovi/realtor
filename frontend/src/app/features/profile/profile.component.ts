import { Component, inject } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { Store } from '@ngxs/store';
import { Logout, Terminate } from 'src/app/core';

@Component({
  selector: 'app-profile',
  imports: [InputTextModule, FluidModule, ButtonModule, FormsModule, DividerModule],
  templateUrl: './profile.component.html',
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
