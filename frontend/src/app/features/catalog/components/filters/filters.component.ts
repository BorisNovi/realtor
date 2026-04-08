import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SelectSingleComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency, PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { ICatalogFilters, IContact, IFetchOptions } from '@shared/interfaces';
import { WorldPhoneMaskPipe } from '@shared/pipes';
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
import { CatalogState, ContactsService } from 'src/app/core';

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
    SelectSingleComponent,
    MultiSelectModule,
    TagModule,
    InputNumberModule,
    TranslatePipe,
  ],
  providers: [WorldPhoneMaskPipe],
  templateUrl: './filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent implements OnInit {
  readonly filtersChange = output<ICatalogFilters>();
  readonly filtersCount = output<number>();

  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly #store = inject(Store);
  readonly #contactsService = inject(ContactsService);
  readonly #translateService = inject(TranslateService);
  readonly #worldPhoneMaskPipe = inject(WorldPhoneMaskPipe);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;

  form!: FormGroup;

  propertyTypes: { label: string; value: string }[] = [];
  statuses: { label: string; value: string }[] = [];
  zoningTypes: { label: string; value: string }[] = [];

  currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);

  readonly isResetDisabled = signal(true);

  readonly contactFetchMethod = (options: IFetchOptions) => this.#contactsService.fetchContacts(options);
  readonly contactMapToSelect = (item: IContact) => ({
    label: `${item?.name} ${this.#worldPhoneMaskPipe.transform(item?.phone)}`,
    value: item,
    id: item.id,
  });
  readonly contactValueMapper = ({ id }: IContact) => id;

  ngOnInit(): void {
    const storedFilters = this.#store.selectSnapshot(CatalogState.filters);

    this.#initPropsTranlstes();
    this.#initForm(storedFilters);
    this.#setupFormListeners();

    if (storedFilters?.contact) {
      this.#contactsService
        .fetchContact(storedFilters.contact)
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe(contact => {
          this.form.patchValue({ contact });
        });
    }
  }

  #setupFormListeners(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(filters => {
        this.filtersChange.emit(this.#normalizeFilters(filters));
      });

    this.form.valueChanges.pipe(startWith(this.form.value), takeUntilDestroyed(this.#destroyRef)).subscribe(filters => {
      const count = countTruthyFields(this.#normalizeFilters(filters));
      this.filtersCount.emit(count);
      this.isResetDisabled.set(!count);
    });
  }

  #normalizeFilters(filters: any): ICatalogFilters {
    const contact = filters.contact;
    return {
      ...filters,
      contact: contact != null && typeof contact === 'object' ? (contact as IContact).id : contact,
    };
  }

  #initForm(filters?: ICatalogFilters): void {
    this.form = this.#fb.group({
      dateAdded: this.#fb.group({
        from: [filters?.dateAdded?.from || null],
        to: [filters?.dateAdded?.to || null],
      }),
      hasPhotos: [filters?.hasPhotos || null],
      status: [filters?.status || null],
      propertyType: [filters?.propertyType || []],
      zoningType: [filters?.zoningType || []],
      contact: [null],
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
