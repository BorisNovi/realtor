import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { RecoverPassword } from 'src/app/core/auth/state/auth.actions';
import { AuthState } from 'src/app/core/auth/state/auth.state';

@Component({
  selector: 'rx-forgot',
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RippleModule,
    ButtonModule,
    TranslatePipe,
  ],
  templateUrl: './forgot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotComponent {
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);

  readonly isLoading = this.#store.selectSignal(AuthState.loading);

  form = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    const { email } = this.form.value;
    if (this.form.invalid || !email) {
      return;
    }

    this.#store.dispatch(new RecoverPassword(email));
  }
}
