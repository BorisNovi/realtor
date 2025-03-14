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

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ButtonModule, InputTextModule, PasswordModule, RippleModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  public isLoading = this.store.selectSignal(AuthState.loading);

  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  public onSubmit(): void {
    const { email, password } = this.form.value;

    if (this.form.invalid || !email || !password) {
      return;
    }

    this.store.dispatch(new Login(email, password));
  }
}
