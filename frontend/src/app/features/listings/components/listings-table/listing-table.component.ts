import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, model, OnDestroy, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { LISTINGS_PAGINATION_KEY } from '@shared/constants';
import { IListing, ISort } from '@shared/interfaces';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { DeletionConfirmationService, QueryParamsService } from 'src/app/core';
import {
  ChangeListingAvaliability,
  DeleteListing,
  FetchListings,
  ListingsState,
  SetListingsPagination,
  SetListingsSort,
} from 'src/app/core/listings/state';
import { CreateListingComponent } from '../create-listing/create-listing.component';
import { LinkSwitchComponent } from '@shared/components';

@Component({
  selector: 'rx-listings-table',
  imports: [
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    DatePipe,
    MenuModule,
    ConfirmDialog,
    DynamicDialogModule,
    ProgressBarModule,
    TranslatePipe,
    RouterLink,
    LinkSwitchComponent,
  ],
  providers: [DialogService],
  templateUrl: './listing-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsTableComponent implements AfterViewInit, OnDestroy {
  readonly pTable = viewChild.required<Table>('pTable');
  readonly menu = viewChild.required<Menu>('menu');

  #ref!: DynamicDialogRef | null;
  readonly #dialogService = inject(DialogService);
  readonly #store = inject(Store);
  readonly #translateService = inject(TranslateService);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly #queryParamsService = inject(QueryParamsService);

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

  onSortChange(event: ISort): void {
    this.#store.dispatch([new SetListingsSort(event), new FetchListings()]);
  }

  #setActionItems(item: IListing): void {
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

  onActionClick(event: Event, item: IListing): void {
    this.#setActionItems(item);
    this.menu().toggle(event);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (typeof event.sortField === 'string' && typeof event.sortOrder === 'number') {
      const sort = { sortField: event.sortField, sortOrder: event.sortOrder === 1 ? 'asc' : 'desc' };
      this.#store.dispatch([new SetListingsSort(sort), new FetchListings()]);
    }

    // Используется, чтобы перебить переключение пагинации при сортировке
    if (this.pTable) {
      const pagination = this.paginationS();
      this.pTable().first = pagination.first;
      this.pTable().rows = pagination.rows;
    }
  }

  pageChange(event: TablePageEvent): void {
    this.#queryParamsService.updateQueryParams(event, LISTINGS_PAGINATION_KEY);
    this.#store.dispatch([new SetListingsPagination(event), new FetchListings()]);
  }

  openDialog(data?: IListing | null): void {
    this.#ref = this.#dialogService.open(CreateListingComponent, {
      data: data,
      header: this.#translateService.instant(data?.id ? 'LISTINGS.DIALOG.EDIT' : 'LISTINGS.DIALOG.ADD'),
      width: '620px',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '640px': '90vw',
      },
    });
  }

  deleteItem(item: IListing): void {
    this.#deletionConfirmationService.confirm(
      () => {
        this.#store.dispatch(new DeleteListing([item.id], { getList: true }));
      },
      { header: 'LISTINGS.DIALOG.DELETE_REQUEST_SINGLE' },
    );
  }

  changeAvaliability(item: IListing, available: boolean | undefined): void {
    this.#store.dispatch(new ChangeListingAvaliability(item.id, { available: available ?? false }));
  }

  ngOnDestroy(): void {
    if (this.#ref) this.#ref.close();
  }
}
