import { AbstractControl, ValidationErrors } from '@angular/forms';

export function strongPasswordValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';

    if (!value) return null;

    const hasUppercase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*()\-_=+[{\]};:'",<.>/?`~\\|]/.test(value);

    if (hasUppercase && hasDigit && hasSymbol) return null;

    return {
      strongPassword: {
        message: 'AUTH.PASSWORD_PATTERN_ERROR',
        hasUppercase,
        hasDigit,
        hasSymbol,
      },
    };
  };
}
