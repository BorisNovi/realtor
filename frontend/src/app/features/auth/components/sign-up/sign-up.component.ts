import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { matchValuesValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ActivateAfterSignup, Signup } from 'src/app/core/auth/state/auth.actions';
import { AuthState } from 'src/app/core/auth/state/auth.state';

@Component({
  selector: 'app-sign-up',
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
  templateUrl: './sign-up.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  private token: string | null = this.router.parseUrl(this.router.url).queryParamMap.get('token');
  public isLoading = this.store.selectSignal(AuthState.loading);

  public form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
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

  public ngOnInit(): void {
    if (this.token) {
      this.store.dispatch(new ActivateAfterSignup(this.token));
    }
  }

  public onSubmit(): void {
    const { email, password, passwordConfirmation } = this.form.value;

    if (this.form.invalid || !email || !password || !passwordConfirmation) {
      return;
    }

    this.store.dispatch(new Signup(email, password, passwordConfirmation));
  }
}
