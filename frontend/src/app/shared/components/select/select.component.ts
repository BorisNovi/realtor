import { Component, DestroyRef, inject, input, model, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IContact, IFetchOptions, IPagination, ITableData } from '@shared/interfaces';
import { ScrollerOptions, SelectItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { Observable, Subject, switchMap, tap } from 'rxjs';

// TODO: добавить поиск
@Component({
  selector: 'rx-select',
  standalone: true,
  imports: [SelectModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly #destroyRef = inject(DestroyRef);

  readonly contact = model<IContact | null>(null);
  readonly fetchMethod = input.required<(options: IFetchOptions) => Observable<ITableData<any>>>();
  readonly mapToSelectItem = input.required<(item: any) => SelectItem>();
  readonly pageSize = input(25);
  readonly placeholder = input('Select item');

  readonly items = signal<SelectItem[]>([]);
  readonly loading = signal(false);
  readonly #loadPage$ = new Subject<IPagination>();

  #totalOnServer = 0;

  readonly #dataSignal = toSignal(
    this.#loadPage$.pipe(
      takeUntilDestroyed(this.#destroyRef),
      tap(() => this.loading.set(true)),
      switchMap(pagination =>
        this.fetchMethod()({ pagination }).pipe(
          tap(res => {
            this.#totalOnServer = res.total;
            const newItems = res.items.map(this.mapToSelectItem());
            this.items.update(current => [...current, ...newItems]);
            this.loading.set(false);
          }),
        ),
      ),
    ),
    { initialValue: null },
  );

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
    if (event.last >= this.items().length - threshold) {
      const pagination: IPagination = {
        first: this.items().length,
        rows: this.pageSize(),
      };
      this.#loadPage$.next({ first: this.items().length, rows: this.pageSize() });
    }
  }
}
