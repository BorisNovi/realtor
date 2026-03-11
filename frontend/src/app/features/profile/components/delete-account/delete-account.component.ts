import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { InputWrapperComponent } from '@shared/components';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { DeleteAccount } from 'src/app/core/profile/state';

@Component({
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    AutoFocusModule,
    InputWrapperComponent,
    TranslatePipe,
    MessageModule,
  ],
  templateUrl: './delete-account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountComponent {
  readonly #ref = inject(DynamicDialogRef);
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);

  form = this.#fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    const { password } = this.form.value;

    if (!this.form.valid || typeof password != 'string') return;

    this.#store
      .dispatch(new DeleteAccount(password))
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.#ref.close();
      });
  }

  onCancel(): void {
    this.#ref.close();
  }
}
