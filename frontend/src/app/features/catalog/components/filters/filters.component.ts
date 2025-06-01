import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency, PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { ICatalogFilters } from '@shared/interfaces';
import { getPropertyStatusBackground, getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CatalogState } from 'src/app/core';

@Component({
  selector: 'app-filters',
  imports: [
    CommonModule,
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

  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly #store = inject(Store);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;

  form!: FormGroup;
  propertyTypes = mapEnumToOptions(PropertyType);
  statuses = mapEnumToOptions(PropertyStatus);
  zoningTypes = mapEnumToOptions(ZoningType);

  currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);
  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  ngOnInit(): void {
    const storedFilters = this.#store.selectSnapshot(CatalogState.filters);

    this.#initForm(storedFilters);
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(filters => {
        this.filtersChange.emit(filters as ICatalogFilters);
      });
  }

  #initForm(filters?: ICatalogFilters): void {
    this.form = this.#fb.group({
      dateAdded: this.#fb.group({
        from: [filters?.dateAdded?.from || null],
        to: [filters?.dateAdded?.to || new Date()],
      }),
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

  // Сброс формы
  resetFilters(): void {
    this.#initForm();
  }
}
