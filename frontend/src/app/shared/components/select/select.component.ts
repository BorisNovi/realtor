import { ChangeDetectionStrategy, Component, DestroyRef, forwardRef, inject, input, model, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IFetchOptions, IPagination, ITableData } from '@shared/interfaces';
import { ScrollerOptions, SelectItem } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { debounceTime, map, Observable, skip, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';

@Component({
  selector: 'rx-select',
  standalone: true,
  imports: [SelectModule, FormsModule, InputText, InputGroup, InputGroupAddonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent {
  readonly #destroyRef = inject(DestroyRef);

  readonly fetchMethod = input.required<(options: IFetchOptions) => Observable<ITableData<any>>>();
  readonly mapToSelectItem = input.required<(item: any) => SelectItem>();
  readonly valueMapper = input<(item: any) => any>(v => v);
  readonly pageSize = input(25);
  readonly withSearch = input(false, { transform: v => v === '' || !!v });
  readonly placeholder = input('Select item');
  readonly emptyMessage = input('');

  readonly selected = model<SelectItem | null>(null);
  readonly items = signal<SelectItem[]>([]);
  readonly loading = signal(false);
  readonly search = signal<any>('');
  readonly #loadPage$ = new Subject<IPagination>();
  #totalOnServer = 0;

  #onChange: (value: any) => void = () => {};
  #onTouched: () => void = () => {};

  constructor() {
    toObservable(this.search)
      .pipe(
        skip(1),
        debounceTime(500),
        map(q => q.trim()),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(() => {
        this.items.set([]);
        this.#loadPage$.next({ first: 0, rows: this.pageSize() });
      });

    this.#loadPage$
      .pipe(
        withLatestFrom(
          toObservable(this.search).pipe(
            map(q => q.trim()),
            startWith(''),
          ),
        ),
        tap(() => this.loading.set(true)),
        switchMap(([pagination, search]) =>
          this.fetchMethod()({ pagination, search }).pipe(
            tap(res => {
              this.#totalOnServer = res.total;
              const newItems = res.items.map(this.mapToSelectItem());
              this.items.update(current => [...current, ...newItems]);
              this.loading.set(false);
            }),
          ),
        ),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();

    toObservable(this.selected)
      .pipe(skip(1), takeUntilDestroyed(this.#destroyRef))
      .subscribe(selectItem => {
        this.#emitValue(selectItem);
      });
  }

  readonly options: ScrollerOptions = {
    showLoader: true,
    step: this.pageSize(),
    onScrollIndexChange: this.#onScroll.bind(this),
  };

  onShow(): void {
    if (this.items().length) return;
    this.#loadPage$.next({ first: 0, rows: this.pageSize() });
  }

  #onScroll(event: { first: number; last: number }): void {
    if (this.loading() || this.items().length >= this.#totalOnServer) return;

    const threshold = 5;
    if (event.last >= this.items().length - threshold)
      this.#loadPage$.next({ first: this.items().length, rows: this.pageSize() });
  }

  #emitValue(value: any | null): void {
    console.log('emit', value)
    const mapped = this.valueMapper()(value);
    this.#onChange(mapped);
  }

  writeValue(value: any): void {
    if (value === undefined || value === null) {
      this.selected.set(null);
      return;
    }
    console.log('vrite', value);
    const mapped = this.mapToSelectItem()(value);
    this.selected.set(mapped);
  }

  registerOnChange(fn: any): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.#onTouched = fn;
  }
}
