import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const matchValuesValidator = (
  mainField: string,
  confirmField: string,
): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(mainField);
    const confirmPassword = control.get(confirmField);

    if (!password || !confirmPassword) return null;

    const mismatch = password.value !== confirmPassword.value;

    if (mismatch) {
      const existingErrors = confirmPassword.errors || {};
      confirmPassword.setErrors({ ...existingErrors, fieldsMismatch: true });
    } else {
      if (confirmPassword.hasError('fieldsMismatch')) {
        const newErrors = { ...confirmPassword.errors };
        delete newErrors['fieldsMismatch'];
        confirmPassword.setErrors(
          Object.keys(newErrors).length > 0 ? newErrors : null,
        );
      }
    }

    return mismatch ? { passwordMismatch: true } : null;
  };
};
