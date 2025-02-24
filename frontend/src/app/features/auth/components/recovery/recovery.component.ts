import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { matchValuesValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';

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
  styleUrl: './recovery.component.scss',
})
export class RecoveryComponent {
  private fb = inject(FormBuilder);

  public form = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        ],
      ],
      repeatPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        ],
      ],
    },
    {
      validators: matchValuesValidator('password', 'repeatPassword'),
    },
  );

  public onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.value);
  }
}
