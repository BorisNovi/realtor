import { Component, DestroyRef, inject, input, model, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IContact, IFetchOptions, IPagination, ITableData } from '@shared/interfaces';
import { ScrollerOptions, SelectItem } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { debounceTime, map, Observable, skip, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';

// TODO: сделать проброс шаблона для отображения
@Component({
  selector: 'rx-select',
  standalone: true,
  imports: [SelectModule, FormsModule, InputText, InputGroup, InputGroupAddonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly #destroyRef = inject(DestroyRef);

  readonly contact = model<IContact | null>(null);
  readonly fetchMethod = input.required<(options: IFetchOptions) => Observable<ITableData<any>>>();
  readonly mapToSelectItem = input.required<(item: any) => SelectItem>();
  readonly pageSize = input(25);
  readonly withSearch = input(false, { transform: v => v === '' || !!v });
  readonly placeholder = input('Select item');
  readonly emptyMessage = input('');

  readonly items = signal<SelectItem[]>([]);
  readonly loading = signal(false);
  readonly search = model<string>('');
  readonly #loadPage$ = new Subject<IPagination>();

  #totalOnServer = 0;

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
        takeUntilDestroyed(this.#destroyRef),
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
      )
      .subscribe();
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
}
