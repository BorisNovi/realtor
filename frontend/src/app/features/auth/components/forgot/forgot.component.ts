import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

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
  ],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotComponent {
  public isPasswordHidden = true;

  private fb = inject(FormBuilder);

  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  public onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.value);
  }
}
