import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { matchValuesValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ActivateAfterRecover, AuthState } from 'src/app/core';

@Component({
  selector: 'rx-recovery',
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
  templateUrl: './recovery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryComponent {
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #router = inject(Router);

  token: string | null = this.#router.parseUrl(this.#router.url).queryParamMap.get('token');
  readonly isLoading = this.#store.selectSignal(AuthState.loading);

  form = this.#fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
      passwordConfirmation: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)],
      ],
    },
    {
      validators: matchValuesValidator('password', 'passwordConfirmation'),
    },
  );

  onSubmit(): void {
    const { password, passwordConfirmation } = this.form.value;

    if (this.form.invalid || !password || !passwordConfirmation || password !== passwordConfirmation || !this.token) {
      return;
    }

    this.#store.dispatch(new ActivateAfterRecover(this.token, password));
  }
}
