import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IFetchOptions, ITableData } from '@shared/interfaces';
import { Subject, switchMap, tap } from 'rxjs';

export interface RxSelectItem {
  label: string;
  value: any;
}

@Component({
  selector: 'rx-select',
  standalone: true,
  imports: [ScrollingModule, NgTemplateOutlet],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T = any> {
  readonly fetcher = input.required<(o: IFetchOptions) => any>();
  readonly mapToSelect = input.required<(src: T) => RxSelectItem>();
  readonly itemTpl = input<any>();
  readonly disabledIds = input<any[]>([]);
  readonly selectable = input(false, { transform: v => v === '' || !!v });
  readonly multiple = input(false, { transform: v => v === '' || !!v });
  readonly open = input<boolean>(false);

  readonly value = model<RxSelectItem[]>([]);
  readonly valueClick = output<RxSelectItem>();

  readonly items = signal<RxSelectItem[]>([]);
  readonly loading = signal(false);
  readonly pageSize = signal(10);

  private readonly loadPage$ = new Subject<{ first: number; rows: number }>();
  private total = 0;
  private initialLoaded = false;

  viewport = viewChild(CdkVirtualScrollViewport);

  constructor() {
    this.loadPage$
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(pagination =>
          this.fetcher()({ pagination } as IFetchOptions).pipe(
            tap((res: ITableData<T>) => {
              this.total = res.total;
              const mapped = res.items.map(i => this.mapToSelect()(i));
              this.items.update(curr => [...curr, ...mapped]);
              this.loading.set(false);
              this.initialLoaded = true;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    toObservable(this.open)
      .pipe(
        takeUntilDestroyed(),
        tap(isOpen => {
          if (isOpen) this.onShow();
        }),
      )
      .subscribe();
  }

  trackByValue = (_: number, item: RxSelectItem) => item.value;
  isDisabled = (i: RxSelectItem) => this.disabledIds().includes(i.value.id);
  isSelected = (i: RxSelectItem) =>
    this.multiple() ? this.value().some(x => x.value === i.value) : this.value()[0]?.value === i.value;

  onShow(): void {
    setTimeout(() => this.viewport()?.checkViewportSize(), 0);

    if (this.items().length && this.initialLoaded) return;

    this.items.set([]);
    this.loadPage$.next({ first: 0, rows: this.pageSize() });
  }

  onScrolled(): void {
    const view = this.viewport();
    if (!view) return;

    const end = view.getRenderedRange().end;
    const total = this.items().length;

    if (!this.loading() && total < this.total && end >= total - 5) this.loadPage$.next({ first: total, rows: this.pageSize() });
  }

  toggle(item: RxSelectItem): void {
    if (this.isDisabled(item) || !this.selectable()) return;

    if (this.multiple()) {
      const exists = this.value().some(v => v.value === item.value);
      this.value.update(exists ? curr => curr.filter(x => x.value !== item.value) : curr => [...curr, item]);
      return;
    }

    const current = this.value()[0];
    if (current?.value === item.value) this.value.set([]);
    else this.value.set([item]);
  }

  onItemClick(item: RxSelectItem): void {
    if (this.isDisabled(item)) return;
    this.valueClick.emit(item);
  }
}
