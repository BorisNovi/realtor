import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/core/auth/state/auth.state';
import { RecoverPassword } from 'src/app/core/auth/state/auth.actions';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot',
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
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  public isLoading = this.store.selectSignal(AuthState.loading);

  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  public onSubmit(): void {
    const { email } = this.form.value;
    if (this.form.invalid || !email) {
      return;
    }

    this.store.dispatch(new RecoverPassword(email));
  }
}
