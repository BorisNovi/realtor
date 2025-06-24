import { Component, effect, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IFieldsetConfig } from '@shared/interfaces';
import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'rx-fieldset-checkbox-group',
  standalone: true,
  imports: [ReactiveFormsModule, Checkbox, TranslatePipe],
  templateUrl: './fieldset-checkbox-group.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldsetCheckboxGroupComponent),
      multi: true,
    },
  ],
})
export class FieldsetCheckboxGroupComponent implements ControlValueAccessor {
  readonly fieldsetConfig = input.required<IFieldsetConfig[]>();

  readonly #fb = inject(FormBuilder);

  form: FormGroup = this.#fb.group({});
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const config = this.fieldsetConfig();
      if (config?.length) {
        this.initializeForm();
      }
    });
  }

  private initializeForm(): void {
    const group: Record<string, FormGroup> = {};
    this.fieldsetConfig().forEach(fieldset => {
      const controls: Record<string, boolean> = {};
      fieldset.fields.forEach(field => {
        controls[field.formControlName] = false;
      });
      group[fieldset.formGroupName] = this.#fb.group(controls);
    });
    this.form = this.#fb.group(group);
    this.form.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
    });
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
