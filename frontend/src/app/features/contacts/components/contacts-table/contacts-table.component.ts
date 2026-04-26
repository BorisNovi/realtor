import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, output, viewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CardsGridComponent, SearchInputComponent } from '@shared/components';
import { IContact, IPagination } from '@shared/interfaces';
import { WorldPhoneMaskPipe } from '@shared/pipes';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu, MenuModule } from 'primeng/menu';
import { PaginatorState } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ContactsState, DeleteContact, DeletionConfirmationService, FetchContacts, SetContactsSearch, ViewMode, ViewModeService } from 'src/app/core';
import { CreateContactComponent } from '../create-contact/create-contact.component';

@Component({
  selector: 'rx-contacts-table',
  imports: [
    TableModule,
    ButtonModule,
    DatePipe,
    MenuModule,
    ConfirmDialog,
    DynamicDialogModule,
    ProgressBarModule,
    TranslatePipe,
    WorldPhoneMaskPipe,
    TooltipModule,
    CardsGridComponent,
    CardModule,
    SearchInputComponent,
  ],
  providers: [DialogService],
  templateUrl: './contacts-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsTableComponent implements AfterViewInit, OnDestroy {
  readonly pTable = viewChild<Table>('pTable');
  readonly menu = viewChild.required<Menu>('menu');

  readonly paginationChange = output<IPagination>();
  readonly sortChange = output<{ sortField: string; sortOrder: string }>();

  #ref!: DynamicDialogRef | null;
  readonly #dialogService = inject(DialogService);
  readonly #store = inject(Store);
  readonly #translateService = inject(TranslateService);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly #viewModeService = inject(ViewModeService);

  readonly viewMode = this.#viewModeService.viewMode;
  readonly contactTrackBy = (item: IContact) => item.id;

  actionItems: MenuItem[] = [];

  readonly tableDataS = this.#store.selectSignal(ContactsState.contacts);
  readonly paginationS = this.#store.selectSignal(ContactsState.pagination);
  readonly loadingS = this.#store.selectSignal(ContactsState.loading);

  ViewMode = ViewMode;

  onSearch(query: string): void {
    this.#store.dispatch([new SetContactsSearch(query), new FetchContacts()]);
  }

  ngAfterViewInit(): void {
    const table = this.pTable();
    if (table) {
      const pagination = this.paginationS();
      table.first = pagination.first;
      table.rows = pagination.rows;
    }
  }

  #setActionItems(item: IContact): void {
    this.actionItems = [
      {
        label: this.#translateService.instant('ACTIONS.EDIT'),
        icon: 'pi pi-pencil',
        command: () => this.openDialog(item),
      },
      {
        separator: true,
      },
      {
        label: this.#translateService.instant('ACTIONS.DELETE'),
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
    const table = this.pTable();
    if (table) {
      const pagination = this.paginationS();
      table.first = pagination.first;
      table.rows = pagination.rows;
    }
  }

  pageChange(event: TablePageEvent): void {
    this.paginationChange.emit(event);
  }

  onCardsPageChange(event: PaginatorState): void {
    this.paginationChange.emit({ first: event.first ?? 0, rows: event.rows ?? 20 });
  }

  toggleViewMode(): void {
    this.#viewModeService.toggle();
  }

  openDialog(data?: IContact | null): void {
    this.#ref = this.#dialogService.open(CreateContactComponent, {
      data: data,
      header: this.#translateService.instant(data?.id ? 'CONTACTS.DIALOG.EDIT' : 'CONTACTS.DIALOG.ADD'),
      width: '480px',
      modal: true,
      closable: true,
      dismissableMask: true,
      draggable: false,
      contentStyle: { overflow: 'auto' },
      focusOnShow: false,
      breakpoints: {
        '640px': '90vw',
      },
    });
  }

  deleteItem(item: IContact): void {
    this.#deletionConfirmationService.confirm(
      () => {
        this.#store.dispatch(new DeleteContact([item.id]));
      },
      { header: 'CONTACTS.DIALOG.DELETE_REQUEST_SINGLE' },
    );
  }

  ngOnDestroy(): void {
    if (this.#ref) this.#ref.close();
  }
}
