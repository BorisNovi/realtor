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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { IContact, IPagination } from '@shared/interfaces';
import { IListing } from '@shared/interfaces/listing.interface';
import { WorldPhoneMaskPipe } from '@shared/pipes';
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
import { tap } from 'rxjs';
import { DeletionConfirmationService } from 'src/app/core';
import { DeleteListing, FetchListing, ListingsState } from 'src/app/core/listings/state';

@Component({
  selector: 'rx-listings-table',
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
  templateUrl: './listing-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsTableComponent implements AfterViewInit, OnDestroy {
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

  readonly tableDataS = this.#store.selectSignal(ListingsState.listings);
  readonly paginationS = this.#store.selectSignal(ListingsState.pagination);
  readonly loadingS = this.#store.selectSignal(ListingsState.loading);

  readonly search = model<string>('');

  ngAfterViewInit(): void {
    const pagination = this.paginationS();
    this.pTable().first = pagination.first;
    this.pTable().rows = pagination.rows;
  }

  #setActionItems(item: IListing): void {
    this.actionItems = [
      {
        label: this.#translateService.instant('LISTINGS.TABLE.ACTIONS.EDIT'),
        icon: 'pi pi-pencil',
        command: () => this.openItemDialog(item.id),
      },
      {
        separator: true,
      },
      {
        label: this.#translateService.instant('LISTINGS.TABLE.ACTIONS.DELETE'),
        icon: 'pi pi-trash',
        command: () => this.deleteItem(item),
      },
    ];
  }

  onActionClick(event: Event, item: IListing): void {
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
      .dispatch(new FetchListing(id))
      .pipe(
        tap(() => {
          const listing = this.#store.selectSnapshot(ListingsState.listing);
          this.openDialog(listing);
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  openDialog(data?: IListing | null): void {
    // this.#ref = this.#dialogService.open(CreateListingComponent, {
    //   data: data,
    //   header: this.#translateService.instant(data?.id ? 'LISTINGS.TABLE.DIALOG.EDIT' : 'LISTINGS.TABLE.DIALOG.ADD'),
    //   width: '480px',
    //   modal: true,
    //   closable: true,
    //   contentStyle: { overflow: 'auto' },
    //   focusOnShow: false,
    //   breakpoints: {
    //     '640px': '90vw',
    //   },
    // });
  }

  deleteItem(item: IListing): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new DeleteListing([item.id]));
    });
  }

  ngOnDestroy(): void {
    if (this.#ref) this.#ref.close();
  }
}
