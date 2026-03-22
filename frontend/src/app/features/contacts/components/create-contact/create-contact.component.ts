import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { InputWrapperComponent } from '@shared/components';
import { WorldPhoneMasksDirective } from '@shared/directives';
import { IContact } from '@shared/interfaces';
import { clearPhone } from '@shared/utils';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { switchMap, tap } from 'rxjs';
import { ContactsState, CreateContact, UpdateContact } from 'src/app/core';

@Component({
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TextareaModule,
    WorldPhoneMasksDirective,
    InputWrapperComponent,
    TranslatePipe,
    AutoFocusModule,
  ],
  templateUrl: './create-contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateContactComponent implements OnInit {
  readonly #ref = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);

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
      additionalPhone: [data?.additionalPhone || null],
      comment: [data?.comment || null, [Validators.maxLength(200)]],
    });
  }

  validPhone(valid: boolean): void {
    const phoneControl = this.form?.get('phone');
    phoneControl?.setErrors(valid ? null : { invalidPhone: true });
  }

  validAddPhone(valid: boolean): void {
    const phoneControl = this.form?.get('additionalPhone');
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
          additionalPhone: clearPhone(formData.additionalPhone),
        }
      : { ...formData, phone: clearPhone(formData.phone), additionalPhone: clearPhone(formData.additionalPhone) };

    const action = hasId ? new UpdateContact(payload) : new CreateContact(payload);

    this.#store
      .dispatch(action)
      .pipe(
        switchMap(() => this.#store.select(ContactsState.contact)),
        tap(contact => this.#ref.close(contact)),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  onCancel(): void {
    this.#ref.close();
  }
}
