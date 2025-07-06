import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { AddressPickerComponent, FieldsetCheckboxGroupComponent, InputWrapperComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { createItemsFieldsetConfig } from '@shared/constants/fieldset.configs';
import { ScrollToTopOnShowDirective, WorldPhoneMasksDirective } from '@shared/directives';
import {
  Currency,
  FurnishedStatus,
  HeatingType,
  KitchenType,
  PropertyStatus,
  PropertyType,
  RenovationStatus,
  ZoningType,
} from '@shared/enums';
import { IPickerAddress } from '@shared/interfaces/picker-address.interface';
import { getPropertyStatusBackground, getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { startWith, tap } from 'rxjs';
import { CreatePropertyObject, FileUploadService, UpdatePropertyObject } from 'src/app/core';
import { AddressFormComponent } from '../address-form/address-form.component';
import { LngLatLike } from 'maplibre-gl';

@Component({
  imports: [
    FileUploadModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    TagModule,
    DividerModule,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    WorldPhoneMasksDirective,
    MessageModule,
    InputWrapperComponent,
    TranslatePipe,
    FieldsetCheckboxGroupComponent,
    AddressPickerComponent,
    ScrollToTopOnShowDirective,
    AddressFormComponent,
  ],
  templateUrl: './create-catalog-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlide', [
      state('void', style({ opacity: 0, height: '0px', marginBottom: '0' })),
      state('*', style({ opacity: 1, height: '*', marginBottom: '*' })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
  ],
})
export class CreateCatalogItemComponent implements OnInit {
  readonly fileUpload = viewChild.required<FileUpload>('fileUpload');

  readonly #ref = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly #fileUploadService = inject(FileUploadService);
  readonly #translateService = inject(TranslateService);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;
  readonly fieldsetConfig = createItemsFieldsetConfig;
  readonly position = signal<LngLatLike>([0, 0]);

  form!: FormGroup;

  readonly photosS = signal<string[]>([]);
  readonly uploadErrorS = signal<string | null>(null);

  readonly propertyTypes = mapEnumToOptions(PropertyType, value =>
    this.#translateService.instant(`FORM.PROPERTIES.PROPERTY_TYPE.${value}`),
  );
  readonly statuses = mapEnumToOptions(PropertyStatus, value =>
    this.#translateService.instant(`FORM.PROPERTIES.PROPERTY_STATUS.${value}`),
  );
  readonly zoningTypes = mapEnumToOptions(ZoningType, value =>
    this.#translateService.instant(`FORM.PROPERTIES.ZONING_TYPE.${value}`),
  );
  readonly heatingTypes = mapEnumToOptions(HeatingType, value =>
    this.#translateService.instant(`FORM.PROPERTIES.HEATING_TYPE.${value}`),
  );
  readonly furnishedStatuses = mapEnumToOptions(FurnishedStatus, value =>
    this.#translateService.instant(`FORM.PROPERTIES.FURNISHED_STATUS.${value}`),
  );
  readonly renovationStatuses = mapEnumToOptions(RenovationStatus, value =>
    this.#translateService.instant(`FORM.PROPERTIES.RENOVATION_STATUS.${value}`),
  );
  readonly kitchenTypes = mapEnumToOptions(KitchenType, value =>
    this.#translateService.instant(`FORM.PROPERTIES.KITCHEN_TYPE.${value}`),
  );
  readonly currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);

  readonly isCommentVisible = signal(!!this.config.data?.comment || false);
  readonly isAdditionalParamsVisible = signal(!!this.config.data?.specifics || false);
  readonly isPickerOpen = signal(false);

  get addressGroup(): FormGroup {
    return this.form.get('address') as FormGroup;
  }

  ngOnInit(): void {
    this.#initForm();
  }

  #initForm(): void {
    const data = this.config.data;

    this.form = this.#fb.group({
      photos: [data?.photos || []],
      propertyType: [data?.propertyType || null, Validators.required],
      zoningType: [data?.zoningType || null, Validators.required],
      status: [data?.status || null, Validators.required],
      address: this.#fb.group({}),
      area: [data?.area || null, [Validators.required, Validators.min(1)]],

      price: this.#fb.group({
        currency: [data?.price?.currency || null, Validators.required],
        value: [data?.price?.value || null, [Validators.required, Validators.min(0)]],
      }),

      contact: this.#fb.group({
        name: [data?.contact?.name || null, [Validators.required]],
        phone: [data?.contact?.phone || null, [Validators.required]],
      }),

      comment: [data?.comment || null],

      specifics: this.#fb.group({
        rooms: [data?.specifics?.rooms || null, [Validators.min(1), Validators.max(200)]],
        floor: this.#fb.group({
          current: [data?.specifics?.floor?.current || null, [Validators.min(-10), Validators.max(200)]],
          full: [data?.specifics?.floor?.full || null, Validators.min(1)],
        }),
        kitchen: [data?.specifics?.kitchen || null],
        heating: [data?.specifics?.utilities?.heating || null],
        furnished: [data?.specifics?.furnished || null],
        renovation: [data?.specifics?.renovation || null],

        options: [data?.specifics?.options || null],
      }),
    });

    this.photosS.set(data?.photos || []);

    const priceGroup = this.form.get('price') as FormGroup;
    const currencyCtrl = priceGroup.get('currency');
    const valueCtrl = priceGroup.get('value');
    currencyCtrl?.valueChanges
      .pipe(startWith(currencyCtrl.value), takeUntilDestroyed(this.#destroyRef))
      .subscribe(currency => (currency ? valueCtrl!.enable({ emitEvent: false }) : valueCtrl!.disable({ emitEvent: false })));
  }

  choose(callback: VoidFunction): void {
    callback();
    this.uploadErrorS.set(null);
  }

  onUpload(event: FileUploadHandlerEvent): void {
    if (event && Array.isArray(event.files)) {
      const files: File[] = event.files;

      this.#fileUploadService
        .upload(files)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe({
          next: (newUrls: string[]) => {
            this.photosS.update(currentUrls => [...currentUrls, ...newUrls]);
            this.form.patchValue({ photos: this.photosS() });
            this.fileUpload().clear();
            this.uploadErrorS.set(null);
          },
          error: err => {
            const errorMessage = err?.message || 'File upload failed';
            this.uploadErrorS.set(errorMessage);
            console.error('File upload failed:', err);
          },
        });
    }
  }

  onAddresPickerFill(picked: IPickerAddress | null): void {
    this.position.set(picked?.coordinates || [0, 0]);
    const address = this.form.get('address')! as FormGroup;
    address.get('city')?.setValue(picked?.address.city);
    address.get('road')?.setValue(picked?.address.road);
    address.get('house')?.setValue(picked?.address.house_number);
    address.get('position')?.setValue(picked?.coordinates);
  }

  removePhoto(index: number): void {
    this.photosS.update(currentUrls => {
      const updated = [...currentUrls];
      updated.splice(index, 1);
      return updated;
    });
    this.form.patchValue({ photos: this.photosS() });
  }

  validPhone(valid: boolean): void {
    const phoneControl = this.form?.get('contact.phone');
    phoneControl?.setErrors(valid ? null : { invalidPhone: true });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;
    const cleanPhone = formData.contact.phone?.replace(/\D/g, '') ?? null;
    const position = this.position();
    const hasId = Boolean(this.config.data?.id);

    const payload = hasId
      ? {
          ...this.config.data,
          ...formData,
          price: { ...this.config.data!.price, ...formData.price },
          contact: { ...this.config.data!.contact, name: formData.contact.name, phone: cleanPhone },
          specifics: { ...this.config.data!.specifics, ...formData.specifics },
          photos: this.photosS(),
        }
      : {
          ...formData,
          contact: { name: formData.contact.name, phone: cleanPhone },
          // TODO: заглушку надо убрать, как димас напишет обработку адреса
          address: 'заглушка',
          photos: this.photosS(),
        };

    const action = hasId ? new UpdatePropertyObject(payload) : new CreatePropertyObject(payload);

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
