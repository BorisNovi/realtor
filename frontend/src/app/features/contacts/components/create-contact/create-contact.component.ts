import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { InputWrapperComponent } from '@shared/components';
import { createItemsFieldsetConfig } from '@shared/constants/fieldset.configs';
import { WorldPhoneMasksDirective } from '@shared/directives';
import { clearPhone, getPropertyStatusBackground, getPropertyStatusSeverity } from '@shared/utils';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { tap } from 'rxjs';
import { CreateContact, UpdateContact } from 'src/app/core/contacts/state/contacts.actions';

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
  readonly #translateService = inject(TranslateService);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;
  readonly fieldsetConfig = createItemsFieldsetConfig;
  readonly position = signal<LngLatLike>([0, 0]);

  form!: FormGroup;

  ngOnInit(): void {
    this.#initForm();
  }

  #initForm(): void {
    const data = this.config.data;

    this.form = this.#fb.group({
      name: [data?.contact?.name || null, [Validators.required]],
      phone: [data?.contact?.phone || null, [Validators.required]],
      additional_phone: [data?.contact?.additional_phone || null],
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
          contact: {
            ...this.config.data!.contact,
            name: formData.name,
            phone: clearPhone(formData.phone),
            additional_phone: clearPhone(formData.additional_phone),
          },
        }
      : { ...formData, phone: clearPhone(formData.phone), additional_phone: clearPhone(formData.additional_phone) };

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
