import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-input-wrapper',
  templateUrl: './input-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputWrapperComponent implements AfterContentInit {
  readonly control = input.required<AbstractControl>();
  readonly label = input.required<string>();
  readonly id = input.required<string>();
  readonly #translateService = inject(TranslateService);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly #destroyRef = inject(DestroyRef);

  readonly isRequired = computed(() => this.control()?.hasValidator(Validators.required) ?? false);

  readonly errorMessage = computed(() => {
    const errors = this.control()?.errors;
    const label = this.label();
    if (!errors) return '';

    if (errors['required']) {
      return this.#translateService.instant('FORM.ERRORS.REQUIRED', { label });
    }
    if (errors['min']) {
      return this.#translateService.instant('FORM.ERRORS.MIN', { label, min: errors['min'].min });
    }
    if (errors['max']) {
      return this.#translateService.instant('FORM.ERRORS.MAX', { label, max: errors['max'].max });
    }
    return this.#translateService.instant('FORM.ERRORS.INVALID', { label });
  });

  ngAfterContentInit(): void {
    this.control()
      .statusChanges.pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.#cdr.markForCheck();
      });
  }
}
