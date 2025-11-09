import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IFetchOptions, IPagination, ITableData } from '@shared/interfaces';
import { ScrollerOptions, SelectItem } from 'primeng/api';
import { debounceTime, map, skip, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';

export abstract class BaseSelect<T = any> {
  readonly #destroyRef = inject(DestroyRef);

  protected readonly items = signal<SelectItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly search = signal('');
  protected readonly pageSize = signal(25);

  protected readonly loadPage$ = new Subject<IPagination>();
  protected totalOnServer = 0;
  protected initialItemsLoaded = false;

  protected abstract fetchMethod(options: IFetchOptions): any;
  protected abstract mapToSelectItem(item: T): SelectItem;

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
        this.loadPage$.next({ first: 0, rows: this.pageSize() });
      });

    this.loadPage$
      .pipe(
        withLatestFrom(
          toObservable(this.search).pipe(
            map(q => q.trim()),
            startWith(''),
          ),
        ),
        tap(() => this.loading.set(true)),
        switchMap(([pagination, search]) =>
          this.fetchMethod({ pagination, search }).pipe(
            tap((res: ITableData<T>) => {
              this.totalOnServer = res.total;
              const newItems = res.items.map(i => this.mapToSelectItem(i));
              this.items.update(curr => [...curr, ...newItems]);
              this.loading.set(false);
            }),
          ),
        ),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  protected onShowBase(): void {
    if (this.items().length && !this.initialItemsLoaded) return;
    if (this.initialItemsLoaded) this.items.set([]);

    this.loadPage$.next({ first: 0, rows: this.pageSize() });
    this.initialItemsLoaded = false;
  }

  protected onScrollBase(event: { first: number; last: number }): void {
    if (this.loading() || this.items().length >= this.totalOnServer) return;

    const threshold = 5;
    if (event.last >= this.items().length - threshold)
      this.loadPage$.next({ first: this.items().length, rows: this.pageSize() });
  }

  protected readonly scrollerOptions: ScrollerOptions = {
    showLoader: true,
    step: this.pageSize(),
    onScrollIndexChange: (e: any) => this.onScrollBase(e),
  };
}
