import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency, PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { ICatalogFilters } from '@shared/interfaces';
import { countTruthyFields, getPropertyStatusBackground, getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { CatalogState } from 'src/app/core';

@Component({
  selector: 'rx-filters',
  imports: [
    CommonModule,
    CheckboxModule,
    ReactiveFormsModule,
    DatePickerModule,
    DividerModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
    TagModule,
    InputNumberModule,
    TranslatePipe,
  ],
  templateUrl: './filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent implements OnInit {
  readonly filtersChange = output<ICatalogFilters>();
  readonly filtersCount = output<number>();

  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly #store = inject(Store);
  readonly #translateService = inject(TranslateService);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;

  form!: FormGroup;

  propertyTypes: { label: string; value: string }[] = [];
  statuses: { label: string; value: string }[] = [];
  zoningTypes: { label: string; value: string }[] = [];

  currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);

  readonly isResetDisabled = signal(true);

  ngOnInit(): void {
    const storedFilters = this.#store.selectSnapshot(CatalogState.filters);

    this.#initForm(storedFilters);
    this.#initPropsTranlstes();

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(filters => {
        this.filtersChange.emit(filters as ICatalogFilters);
      });

    this.form.valueChanges.pipe(startWith(this.form.value), takeUntilDestroyed(this.#destroyRef)).subscribe(filters => {
      const count = countTruthyFields(filters);
      this.filtersCount.emit(count);
      this.isResetDisabled.set(!count);
    });
  }

  #initForm(filters?: ICatalogFilters): void {
    this.form = this.#fb.group({
      dateAdded: this.#fb.group({
        from: [filters?.dateAdded?.from || null],
        to: [filters?.dateAdded?.to || null],
      }),
      hasPhotos: [filters?.hasPhotos || false],
      status: [filters?.status || null],
      propertyType: [filters?.propertyType || []],
      zoningType: [filters?.zoningType || []],
      area: this.#fb.group({
        min: [filters?.area?.min || null],
        max: [filters?.area?.max || null],
      }),
      price: this.#fb.group({
        currency: [filters?.price?.currency || null],
        min: [filters?.price?.min || null],
        max: [filters?.price?.max || null],
      }),
    });
  }

  #initPropsTranlstes(): void {
    this.#translateService.onLangChange.pipe(startWith(null), takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      this.propertyTypes = mapEnumToOptions(PropertyType, value =>
        this.#translateService.instant(`FORM.PROPERTIES.PROPERTY_TYPE.${value}`),
      );
      this.statuses = mapEnumToOptions(PropertyStatus, value =>
        this.#translateService.instant(`FORM.PROPERTIES.PROPERTY_STATUS.${value}`),
      );
      this.zoningTypes = mapEnumToOptions(ZoningType, value =>
        this.#translateService.instant(`FORM.PROPERTIES.ZONING_TYPE.${value}`),
      );
    });
  }

  // Сброс формы
  resetFilters(): void {
    this.form.reset();
    this.filtersChange.emit({ ...this.form.value, propertyType: [], zoningType: [] });
  }
}
