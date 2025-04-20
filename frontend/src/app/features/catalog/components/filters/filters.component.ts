import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyType, ZoningType, PropertyStatus, Currency } from '@shared/enums';
import { ICatalogItem } from '@shared/interfaces';
import { getPropertyStatusBackground, getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  ],
  templateUrl: './filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<Partial<ICatalogItem>>();
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  public readonly getSeverity = getPropertyStatusSeverity;
  public readonly getStatusBackground = getPropertyStatusBackground;

  public form!: FormGroup;
  public propertyTypes = mapEnumToOptions(PropertyType);
  public statuses = mapEnumToOptions(PropertyStatus);
  public zoningTypes = mapEnumToOptions(ZoningType);

  public currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);
  public getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  public ngOnInit(): void {
    this.initForm();
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(filters => {
      console.log(filters);
      // this.filtersChange.emit(filters);
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      dateAdded: this.fb.group({
        from: [null],
        to: [null],
      }),
      status: [null],
      propertyType: [[]],
      zoningType: [[]],
      area: this.fb.group({
        min: [null],
        max: [null],
      }),
      price: this.fb.group({
        currency: [null],
        min: [null],
        max: [null],
      }),
    });
  }

  // Сброс формы
  public resetFilters(): void {
    this.form.reset();
  }
}
