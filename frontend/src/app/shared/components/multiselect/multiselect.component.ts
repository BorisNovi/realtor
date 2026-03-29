import { booleanAttribute, ChangeDetectionStrategy, Component, forwardRef, input, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IFetchOptions, ITableData } from '@shared/interfaces';
import { SelectItem } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, skip } from 'rxjs';
import { BaseSelect } from 'src/app/core';

@Component({
  selector: 'rx-multiselect',
  imports: [MultiSelectModule, FormsModule, InputText, InputGroup, InputGroupAddonModule, TranslatePipe],
  templateUrl: 'multiselect.component.html',
  host: {
    class: 'p-inputwrapper',
  },
  styles: `
    :host {
      display: contents;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiselectComponent),
      multi: true,
    },
  ],
})
export class MultiselectComponent extends BaseSelect {
  readonly fetcher = input.required<(options: IFetchOptions) => Observable<ITableData<any>>>();
  readonly mapToSelect = input.required<(item: any) => SelectItem>();
  readonly valueMapper = input<(item: any[]) => any[]>(v => v);
  readonly placeholder = input('Select items');
  protected readonly disabled = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input('');
  readonly withSearch = input(false, { transform: v => v === '' || !!v });

  readonly selectedMulti = model<SelectItem[]>([]);

  #onChange: (value: any) => void = () => {};
  #onTouched: () => void = () => {};

  constructor() {
    super();

    toObservable(this.selectedMulti)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(values => this.emitValue(values));
  }

  protected override fetchMethod(options: IFetchOptions) {
    return this.fetcher()(options);
  }

  protected override mapToSelectItem(item: any): SelectItem {
    return this.mapToSelect()(item);
  }

  onShow(): void {
    this.onShowBase();
  }

  writeValue(value: any): void {
    if (!Array.isArray(value)) return;

    const mapped = value.map(v => this.mapToSelect()(v));
    this.selectedMulti.set(mapped);

    const currentValues = this.items().map(i => i.value);
    const missing = mapped.filter(i => !currentValues.includes(i.value));
    if (missing.length) this.items.update(curr => [...curr, ...missing]);
    this.initialItemsLoaded = true;
  }

  registerOnChange(fn: any): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.#onTouched = fn;
  }

  private emitValue(values: any[]): void {
    const mapped = this.valueMapper()(values);
    this.#onChange(mapped);
  }
}
