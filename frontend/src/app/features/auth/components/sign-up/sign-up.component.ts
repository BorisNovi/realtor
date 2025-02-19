import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { matchValuesValidator } from '@shared/validators';

@Component({
  selector: 'app-sign-up',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  public isPasswordHidden = true;
  public isPasswordRepeatHidden = true;
  private fb = inject(FormBuilder);

  public form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
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
    { validators: matchValuesValidator('password', 'repeatPassword') },
  );

  public onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.value);
  }
}
