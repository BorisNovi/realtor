import { booleanAttribute, ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IFetchOptions, ITableData } from '@shared/interfaces';
import { SelectItem } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Observable } from 'rxjs';
import { BaseSelect } from 'src/app/core';

@Component({
  selector: 'rx-select-single',
  standalone: true,
  imports: [SelectModule, FormsModule, InputText, InputGroup, InputGroupAddonModule, TranslatePipe],
  templateUrl: 'select-single.component.html',
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
      useExisting: forwardRef(() => SelectSingleComponent),
      multi: true,
    },
  ],
})
export class SelectSingleComponent extends BaseSelect {
  readonly fetcher = input.required<(options: IFetchOptions) => Observable<ITableData<any>>>();
  readonly mapToSelect = input.required<(item: any) => SelectItem>();
  readonly valueMapper = input<(item: any) => any>(v => v);
  readonly placeholder = input('Select item');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input('');
  readonly withSearch = input(false, { transform: v => v === '' || !!v });
  readonly translateLabels = input(false, { transform: booleanAttribute });

  readonly selected = signal<SelectItem | null>(null);

  #onChange: (value: any) => void = () => {};
  #onTouched: () => void = () => {};

  protected override fetchMethod(options: IFetchOptions) {
    return this.fetcher()(options);
  }

  protected override mapToSelectItem(item: any): SelectItem {
    return this.mapToSelect()(item);
  }

  onShow(): void {
    this.onShowBase();
  }

  onModelChange(value: any): void {
    this.selected.set(value);
    const mapped = value == null ? null : this.valueMapper()(value);
    this.#onChange(mapped);
    this.#onTouched();
  }

  writeValue(value: any): void {
    if (value == null) return;
    const mapped = this.mapToSelect()(value);
    this.selected.set(mapped);
    if (!this.items().some(i => i.value === mapped.value)) this.items.update(curr => [...curr, mapped]);
    this.initialItemsLoaded = true;
  }

  registerOnChange(fn: any): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.#onTouched = fn;
  }
}
