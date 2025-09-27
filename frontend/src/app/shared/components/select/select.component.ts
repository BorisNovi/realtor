import { Component, DestroyRef, inject, input, model, signal } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { ScrollerOptions, SelectItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { IContact, IPagination, ITableData } from '@shared/interfaces';
import { ContactsService } from 'src/app/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// TODO: компонент надо сделать универсальным
@Component({
  selector: 'rx-select',
  standalone: true,
  imports: [SelectModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly #contactsService = inject(ContactsService);
  readonly #destroyRef = inject(DestroyRef);

  readonly contact = model<IContact | null>(null);
  readonly pageSize = input(25);

  readonly items = signal<SelectItem[]>([]);
  readonly loading = signal(false);

  #totalOnServer = 0;

  options: ScrollerOptions = {
    showLoader: true,
    step: this.pageSize(),
    onScrollIndexChange: this.onScroll.bind(this),
  };

  onShow(): void {
    if (this.items().length) return;
    this.load({ first: 0, rows: this.pageSize() });
  }

  private onScroll(event: { first: number; last: number }): void {
    if (this.loading() || this.items().length >= this.#totalOnServer) return;

    const threshold = 5;
    if (event.last >= this.items().length - threshold) {
      const pagination: IPagination = {
        first: this.items().length,
        rows: this.pageSize(),
      };
      this.load(pagination);
    }
  }

  private load(pagination: IPagination): void {
    this.loading.set(true);

    this.#contactsService
      .fetchContacts(null, {}, pagination, null)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (res: ITableData<IContact>) => {
          this.#totalOnServer = res.total;

          const newItems = res.items.map(i => ({ label: i.name, value: i }));
          this.items.update(current => [...current, ...newItems]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
