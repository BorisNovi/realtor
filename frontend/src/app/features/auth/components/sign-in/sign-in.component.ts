import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { Store } from '@ngxs/store';
import { Login } from 'src/app/core/auth/state/auth.actions';
import { AuthState } from 'src/app/core/auth/state/auth.state';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-in',
  imports: [
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    RippleModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);

  readonly isLoading = this.#store.selectSignal(AuthState.loading);

  form = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    const { email, password } = this.form.value;

    if (this.form.invalid || !email || !password) {
      return;
    }

    this.#store.dispatch(new Login(email, password));
  }
}
