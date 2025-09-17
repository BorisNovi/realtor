import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { IContact, IPagination } from '@shared/interfaces';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableEditCompleteEvent, TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { tap } from 'rxjs';
import { DeletionConfirmationService } from 'src/app/core';
import { DeleteContact, FetchContact } from 'src/app/core/contacts/state/contacts.actions';
import { ContactsState } from 'src/app/core/contacts/state/contacts.state';
import { CreateContactComponent } from '../create-contact/create-contact.component';

@Component({
  selector: 'rx-contacts-table',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    DatePipe,
    MenuModule,
    ConfirmDialog,
    DynamicDialogModule,
    ProgressBarModule,
    TranslatePipe,
  ],
  providers: [DialogService],
  templateUrl: './contacts-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsTableComponent implements AfterViewInit, OnDestroy {
  readonly pTable = viewChild.required<Table>('pTable');
  readonly menu = viewChild.required<Menu>('menu');
  readonly filtersCount = input<number>();

  readonly filtersOpen = output();
  readonly paginationChange = output<IPagination>();
  readonly sortChange = output<{ sortField: string; sortOrder: string }>();

  #ref: DynamicDialogRef | undefined;
  readonly #dialogService = inject(DialogService);
  readonly #store = inject(Store);
  readonly #translateService = inject(TranslateService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);

  actionItems: MenuItem[] = [];

  readonly tableDataS = this.#store.selectSignal(ContactsState.contacts);
  readonly paginationS = this.#store.selectSignal(ContactsState.pagination);
  readonly loadingS = this.#store.selectSignal(ContactsState.loading);

  // TODO: добавить строку поиска сверху таблицы

  ngAfterViewInit(): void {
    const pagination = this.paginationS();
    this.pTable().first = pagination.first;
    this.pTable().rows = pagination.rows;
  }

  onEditComplete(event: TableEditCompleteEvent): void {
    const { id, value: status } = event.data;
  }

  #setActionItems(item: IContact): void {
    this.actionItems = [
      {
        label: this.#translateService.instant('CONTACTS.TABLE.ACTIONS.EDIT'),
        icon: 'pi pi-pencil',
        command: () => this.openItemDialog(item.id),
      },
      {
        separator: true,
      },
      {
        label: this.#translateService.instant('CONTACTS.TABLE.ACTIONS.DELETE'),
        icon: 'pi pi-trash',
        command: () => this.deleteItem(item),
      },
    ];
  }

  onActionClick(event: Event, item: IContact): void {
    this.#setActionItems(item);
    this.menu().toggle(event);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (typeof event.sortField === 'string' && typeof event.sortOrder === 'number')
      this.sortChange.emit({ sortField: event.sortField, sortOrder: event.sortOrder === 1 ? 'asc' : 'desc' });

    // Используется, чтобы перебить переключение пагинации при сортировке
    if (this.pTable) {
      const pagination = this.paginationS();
      this.pTable().first = pagination.first;
      this.pTable().rows = pagination.rows;
    }
  }

  pageChange(event: TablePageEvent): void {
    this.paginationChange.emit(event);
  }

  onFiltersOpen(): void {
    this.filtersOpen.emit();
  }

  openItemDialog(id?: number): void {
    if (id === undefined || id < 0) {
      this.openDialog();
      return;
    }

    this.#store
      .dispatch(new FetchContact(id))
      .pipe(
        tap(() => {
          const contact = this.#store.selectSnapshot(ContactsState.contact);
          this.openDialog(contact);
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  openDialog(data?: IContact | null): void {
    this.#ref = this.#dialogService.open(CreateContactComponent, {
      data: data,
      header: this.#translateService.instant(data?.id ? 'CONTACTS.TABLE.DIALOG.EDIT' : 'CONTACTS.TABLE.DIALOG.ADD'),
      width: '480px',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      focusOnShow: false,
      breakpoints: {
        '640px': '90vw',
      },
    });
  }

  deleteItem(item: IContact): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new DeleteContact(item.id));
    });
  }

  ngOnDestroy(): void {
    if (this.#ref) this.#ref.close();
  }
}
