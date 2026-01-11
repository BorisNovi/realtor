import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { InputWrapperComponent } from '@shared/components';
import { matchValuesValidator, strongPasswordValidator } from '@shared/validators';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ChangePassword } from 'src/app/core/profile/state';

@Component({
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    AutoFocusModule,
    InputWrapperComponent,
    TranslatePipe,
  ],
  templateUrl: './change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {
  readonly #ref = inject(DynamicDialogRef);
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);

  form = this.#fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator()]],
      passwordConfirmation: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator()]],
    },
    {
      validators: matchValuesValidator('password', 'passwordConfirmation'),
    },
  );

  onSubmit(): void {
    const { password, passwordConfirmation } = this.form.value;

    if (!this.form.valid || typeof password != 'string' || typeof passwordConfirmation != 'string') return;

    this.#store
      .dispatch(new ChangePassword(password, passwordConfirmation))
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe();
  }

  onCancel(): void {
    this.#ref.close();
  }
}
