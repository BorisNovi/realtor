import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { IContact, IPagination } from '@shared/interfaces';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { debounceTime, map, tap } from 'rxjs';
import { DeletionConfirmationService } from 'src/app/core';
import { DeleteContact, FetchContact, FetchContacts, SetContactsSearch } from 'src/app/core/contacts/state/contacts.actions';
import { ContactsState } from 'src/app/core/contacts/state/contacts.state';
import { CreateContactComponent } from '../create-contact/create-contact.component';
import { WorldPhoneMaskPipe } from '@shared/pipes';

@Component({
  selector: 'rx-contacts-table',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    DatePipe,
    MenuModule,
    ConfirmDialog,
    DynamicDialogModule,
    ProgressBarModule,
    TranslatePipe,
    WorldPhoneMaskPipe,
  ],
  providers: [DialogService],
  templateUrl: './contacts-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsTableComponent implements AfterViewInit, OnDestroy {
  readonly pTable = viewChild.required<Table>('pTable');
  readonly menu = viewChild.required<Menu>('menu');
  readonly filtersCount = input<number>();

  readonly paginationChange = output<IPagination>();
  readonly sortChange = output<{ sortField: string; sortOrder: string }>();

  #ref!: DynamicDialogRef | null;
  readonly #dialogService = inject(DialogService);
  readonly #store = inject(Store);
  readonly #translateService = inject(TranslateService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);

  actionItems: MenuItem[] = [];

  readonly tableDataS = this.#store.selectSignal(ContactsState.contacts);
  readonly paginationS = this.#store.selectSignal(ContactsState.pagination);
  readonly loadingS = this.#store.selectSignal(ContactsState.loading);

  readonly search = model<string>('');

  constructor() {
    toObservable(this.search)
      .pipe(
        debounceTime(500),
        map(q => q.trim()),
        takeUntilDestroyed(),
      )
      .subscribe(q => this.#store.dispatch([new SetContactsSearch(q), new FetchContacts()]));
  }

  ngAfterViewInit(): void {
    const pagination = this.paginationS();
    this.pTable().first = pagination.first;
    this.pTable().rows = pagination.rows;
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
      header: this.#translateService.instant(data?.id ? 'CONTACTS.DIALOG.EDIT' : 'CONTACTS.DIALOG.ADD'),
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
