import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { AddressPickerComponent } from '@shared/components';
import { SPECIFICS_FIELDS_BY_TYPE, SpecificsFieldKey } from '@shared/constants/fieldset.configs';
import { ScrollToTopOnShowDirective } from '@shared/directives';
import { PropertyStatus, PropertyType } from '@shared/enums';
import { IPickerAddress } from '@shared/interfaces/picker-address.interface';
import { WorldPhoneMaskPipe } from '@shared/pipes';
import { getPropertyStatusBackground, getPropertyStatusSeverity } from '@shared/utils';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';
import { startWith, tap } from 'rxjs';
import { AuthState, CreatePropertyObject, UpdatePropertyObject } from 'src/app/core';
import { AddressFormComponent } from './shared/address-form/address-form.component';
import { PropertyBasicFieldsComponent } from './shared/property-basic-fields/property-basic-fields.component';
import { PropertyContactFieldsComponent } from './shared/property-contact-fields/property-contact-fields.component';
import { PropertyPhotosFieldsComponent } from './shared/property-photos-fields/property-photos-fields.component';
import { PropertyPriceFieldsComponent } from './shared/property-price-fields/property-price-fields.component';
import { PropertySpecificsComponent } from './shared/property-specifics/property-specifics.component';

@Component({
  selector: 'rx-create-catalog-item',
  templateUrl: './create-catalog-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [SLIDE],
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ButtonModule,
    DividerModule,
    TextareaModule,
    AddressPickerComponent,
    ScrollToTopOnShowDirective,
    AddressFormComponent,
    PropertyBasicFieldsComponent,
    PropertyPhotosFieldsComponent,
    PropertyPriceFieldsComponent,
    PropertyContactFieldsComponent,
    PropertySpecificsComponent,
  ],
  providers: [WorldPhoneMaskPipe, DialogService],
})
export class CreateCatalogItemComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #ref = inject(DynamicDialogRef);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly config = inject(DynamicDialogConfig);

  readonly #user = this.#store.selectSignal(AuthState.user);

  form!: FormGroup;

  readonly propertyTypeS = signal<PropertyType | null>(null);
  readonly isPickerOpen = signal(false);
  readonly isAdditionalParamsVisible = signal(false);
  readonly isCommentVisible = signal(false);
  readonly position = signal<LngLatLike>([0, 0]);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;

  get addressGroup(): FormGroup {
    return this.form.get('address') as FormGroup;
  }

  get specificsGroup(): FormGroup {
    return this.form.get('specifics') as FormGroup;
  }

  ngOnInit(): void {
    const data = this.config.data;
    const initialType: PropertyType | null = data?.propertyType ?? null;

    this.isAdditionalParamsVisible.set(!!data?.specifics);
    this.isCommentVisible.set(!!data?.comment);
    this.propertyTypeS.set(initialType);

    this.form = this.#fb.group({
      name: [data?.name ?? null],
      photos: [data?.photos ?? []],
      propertyType: [initialType, Validators.required],
      zoningType: [data?.zoningType ?? null, Validators.required],
      status: [data?.status ?? PropertyStatus.available, Validators.required],
      address: this.#fb.group({}),
      area: [data?.area ?? null, [Validators.required, Validators.min(1)]],
      price: this.#fb.group({
        currency: [data?.price?.currency ?? this.#user()?.currency ?? null, Validators.required],
        value: [data?.price?.value ?? null, [Validators.required, Validators.min(0)]],
      }),
      contact: [data?.contact ?? null],
      comment: [data?.comment ?? null],
      specifics: initialType ? this.#buildSpecificsGroup(initialType) : this.#fb.group({}),
    });

    this.form
      .get('propertyType')!
      .valueChanges.pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((type: PropertyType | null) => {
        this.propertyTypeS.set(type);
        this.form.setControl('specifics', type ? this.#buildSpecificsGroup(type) : this.#fb.group({}));
      });

    const priceGroup = this.form.get('price') as FormGroup;
    const currencyCtrl = priceGroup.get('currency')!;
    const valueCtrl = priceGroup.get('value')!;
    currencyCtrl.valueChanges
      .pipe(startWith(currencyCtrl.value), takeUntilDestroyed(this.#destroyRef))
      .subscribe(currency => (currency ? valueCtrl.enable({ emitEvent: false }) : valueCtrl.disable({ emitEvent: false })));
  }

  #buildSpecificsGroup(type: PropertyType): FormGroup {
    const data = this.config.data?.specifics;
    const allowed: SpecificsFieldKey[] = SPECIFICS_FIELDS_BY_TYPE[type];
    const controls: Record<string, unknown> = {};
    const hasCurrentFloor = allowed.includes('currentFloor');
    const hasTotalFloors = allowed.includes('totalFloors');

    if (allowed.includes('rooms')) controls['rooms'] = [data?.rooms ?? null, [Validators.min(1), Validators.max(200)]];

    if (hasCurrentFloor || hasTotalFloors)
      controls['floor'] = this.#fb.group({
        ...(hasCurrentFloor ? { current: [data?.floor?.current ?? null, [Validators.min(-10), Validators.max(200)]] } : {}),
        ...(hasTotalFloors ? { full: [data?.floor?.full ?? null, Validators.min(1)] } : {}),
      });
    if (allowed.includes('kitchen')) controls['kitchen'] = [data?.kitchen ?? null];
    if (allowed.includes('heating')) controls['heating'] = [data?.heating ?? null];
    if (allowed.includes('furnished')) controls['furnished'] = [data?.furnished ?? null];
    if (allowed.includes('renovation')) controls['renovation'] = [data?.renovation ?? null];
    if (allowed.includes('options')) controls['options'] = [data?.options ?? null];

    return this.#fb.group(controls);
  }

  onAddresPickerFill(picked: IPickerAddress | null): void {
    this.position.set(picked?.coordinates ?? [0, 0]);
    const address = this.form.get('address') as FormGroup;
    address.get('country')?.setValue(picked?.address?.country_code);
    address.get('state')?.setValue(picked?.address?.state);
    address
      .get('city')
      ?.setValue(picked?.address?.city ?? picked?.address?.town ?? picked?.address?.village ?? picked?.address?.hamlet);
    address.get('road')?.setValue(picked?.address?.road);
    address.get('house')?.setValue(picked?.address?.house_number);
    address.get('position')?.setValue(picked?.coordinates);

    address.get('country')?.markAsDirty();
    console.log(address.valid);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.getRawValue();
    const hasId = Boolean(this.config.data?.id);
    const type: PropertyType = formData.propertyType;

    const allowedFields: SpecificsFieldKey[] = SPECIFICS_FIELDS_BY_TYPE[type] ?? [];
    const specifics = Object.fromEntries(
      Object.entries(formData.specifics ?? {}).filter(([key]) => {
        // floor в данных формы соответствует currentFloor / totalFloors в конфиге
        if (key === 'floor') return allowedFields.includes('currentFloor') || allowedFields.includes('totalFloors');

        return allowedFields.includes(key as SpecificsFieldKey);
      }),
    );

    const payload = hasId
      ? {
          ...this.config.data,
          ...formData,
          specifics,
          price: { ...this.config.data!.price, ...formData.price },
        }
      : { ...formData, specifics };

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
