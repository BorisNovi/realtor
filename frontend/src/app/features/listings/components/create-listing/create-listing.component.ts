import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { InputWrapperComponent, MultiselectComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { ICatalogItem, IFetchOptions, IListing, IPropertyObject } from '@shared/interfaces';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButton } from 'primeng/togglebutton';
import { tap } from 'rxjs';
import { CatalogService } from 'src/app/core';
import { CreateListing, UpdateListing } from 'src/app/core/listings/state';

@Component({
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    AutoFocusModule,
    InputWrapperComponent,
    TranslatePipe,
    ToggleButton,
    MultiselectComponent,
],
  templateUrl: './create-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateListingComponent implements OnInit {
  readonly #ref = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly #catalogService = inject(CatalogService);
  readonly #translateService = inject(TranslateService);

  form!: FormGroup;

  readonly catalogFetchMethod = (options: IFetchOptions) => this.#catalogService.fetchCatalog(options);
  readonly catalogMapToSelect = (item: ICatalogItem) => ({
    label: `
      ${this.#translateService.instant('FORM.PROPERTIES.PROPERTY_TYPE.' + item?.propertyType)}
      ${item?.address?.city} ${item?.area} m² —
      ${item?.price?.value}
      ${this.getCurrencySymbol((item?.price)?.currency)}
    `,
    value: item,
    id: item.id,
  });

  ngOnInit(): void {
    this.#initForm();
  }

  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  #initForm(): void {
    const data: IListing = this.config.data;

    this.form = this.#fb.group({
      // TODO: добавить читаемый текст ошибок
      name: [data?.name || null, [Validators.required, Validators.maxLength(50)]],
      objects: [data?.propertyObjects || []],
      linkAvailable: [data?.publicLink?.available || true],
    });
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
          name: formData.name,
          propertyObjectIds: formData.objects.map((obj: IPropertyObject) => obj.id),
          publicLink: { linkAvailable: formData.linkAvailable },
        }
      : { name: formData.name, propertyObjectIds: formData.objects, publicLink: { linkAvailable: formData.linkAvailable } };
    const action = hasId ? new UpdateListing(payload) : new CreateListing(payload);

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
