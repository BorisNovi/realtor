import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, signal, WritableSignal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsetCheckboxGroupComponent implements ControlValueAccessor {
  readonly fieldsetConfig = input.required<IFieldsetConfig[]>();

  readonly #fb = inject(FormBuilder);

  form: FormGroup = this.#fb.group({});
  readonly initialValue: WritableSignal<any> = signal(null);

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const config = this.fieldsetConfig();
      const value = this.initialValue();
      if (config?.length) this.initializeForm(value);
    });
  }

  private initializeForm(initialValue: any): void {
    const group: Record<string, FormGroup> = {};
    this.fieldsetConfig().forEach(fieldset => {
      const controls: Record<string, boolean> = {};
      fieldset.fields.forEach(field => {
        const isChecked = !!initialValue?.[fieldset.formGroupName]?.[field.formControlName];
        controls[field.formControlName] = isChecked;
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
    this.initialValue.set(value);
    if (this.form && Object.keys(this.form.controls).length) this.form.patchValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
