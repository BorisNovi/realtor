import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { matchValuesValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ActivateAfterRecover } from 'src/app/core/auth/state/auth.actions';
import { AuthState } from 'src/app/core/auth/state/auth.state';

@Component({
  selector: 'app-recovery',
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RippleModule,
    ButtonModule,
  ],
  templateUrl: './recovery.component.html',
})
export class RecoveryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  public token: string | null = this.router.parseUrl(this.router.url).queryParamMap.get('token');
  public isLoading = this.store.selectSignal(AuthState.loading);

  public form = this.fb.group(
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

  public onSubmit(): void {
    const { password, passwordConfirmation } = this.form.value;

    if (this.form.invalid || !password || !passwordConfirmation || password !== passwordConfirmation || !this.token) {
      return;
    }

    this.store.dispatch(new ActivateAfterRecover(this.token, password));
  }
}
