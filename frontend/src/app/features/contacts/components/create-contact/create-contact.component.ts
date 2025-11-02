import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { InputWrapperComponent } from '@shared/components';
import { createItemsFieldsetConfig } from '@shared/constants/fieldset.configs';
import { WorldPhoneMasksDirective } from '@shared/directives';
import { IContact } from '@shared/interfaces';
import { clearPhone, getPropertyStatusBackground, getPropertyStatusSeverity } from '@shared/utils';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { tap } from 'rxjs';
import { CreateContact, UpdateContact } from 'src/app/core';

@Component({
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    WorldPhoneMasksDirective,
    InputWrapperComponent,
    TranslatePipe,
  ],
  templateUrl: './create-contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [SLIDE],
})
export class CreateContactComponent implements OnInit {
  readonly #ref = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;
  readonly fieldsetConfig = createItemsFieldsetConfig;
  readonly position = signal<LngLatLike>([0, 0]);

  form!: FormGroup;

  ngOnInit(): void {
    this.#initForm();
  }

  #initForm(): void {
    const data: IContact = this.config.data;

    this.form = this.#fb.group({
      // TODO: добавить читаемый текст ошибок
      name: [data?.name || null, [Validators.required, Validators.maxLength(50)]],
      phone: [data?.phone || null, [Validators.required]],
      additional_phone: [data?.additional_phone || null],
    });
  }

  validPhone(valid: boolean): void {
    const phoneControl = this.form?.get('phone');
    phoneControl?.setErrors(valid ? null : { invalidPhone: true });
  }

  validAddPhone(valid: boolean): void {
    const phoneControl = this.form?.get('additional_phone');
    phoneControl?.setErrors(valid ? null : { invalidPhone: true });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;
    const hasId = Boolean(this.config.data?.id);

    const payload = hasId
      ? {
          ...this.config.data,
          ...formData,
          phone: clearPhone(formData.phone),
          additional_phone: clearPhone(formData.additional_phone),
        }
      : { ...formData, phone: clearPhone(formData.phone), additional_phone: clearPhone(formData.additional_phone) };

    console.log(payload);

    const action = hasId ? new UpdateContact(payload) : new CreateContact(payload);

    this.#store
      .dispatch(action)
      .pipe(
        tap(() => this.#ref.close(payload)),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  onCancel(): void {
    this.#ref.close();
  }
}
