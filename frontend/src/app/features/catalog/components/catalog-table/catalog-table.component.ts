import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CardsGridComponent, SearchInputComponent } from '@shared/components';
import { CATALOG_PAGINATION_KEY, CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency, PropertyStatus } from '@shared/enums';
import { ICatalogItem, IPropertyObject } from '@shared/interfaces';
import { getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { CardModule } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu, MenuModule } from 'primeng/menu';
import { PaginatorState } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { startWith, switchMap, tap } from 'rxjs';
import {
  CatalogState,
  DeletePropertyObjects,
  DeletionConfirmationService,
  FetchCatalog,
  FetchPropertyObject,
  QueryParamsService,
  SetCatalogPagination,
  SetCatalogSearch,
  SetCatalogSort,
  UpdateStatus,
  ViewMode,
  ViewModeService,
} from 'src/app/core';
import { CatalogFiltersService } from '../../catalog-filters.service';
import { AddToListingComponent } from '../add-to-listing/add-to-listing.component';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';

@Component({
  selector: 'rx-table',
  imports: [
    FormsModule,
    RouterLink,
    TableModule,
    TagModule,
    ButtonModule,
    CommonModule,
    ButtonGroupModule,
    MenuModule,
    ConfirmDialog,
    DynamicDialogModule,
    SelectModule,
    ProgressBarModule,
    TranslatePipe,
    TooltipModule,
    CardsGridComponent,
    CardModule,
    SearchInputComponent,
  ],
  providers: [DialogService],
  templateUrl: './catalog-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogTableComponent implements AfterViewInit, OnDestroy {
  readonly pTable = viewChild<Table>('pTable');
  readonly menu = viewChild.required<Menu>('menu');

  #ref!: DynamicDialogRef | null;
  readonly #dialogService = inject(DialogService);
  readonly #store = inject(Store);
  readonly #confirmationService = inject(ConfirmationService);
  readonly #translateService = inject(TranslateService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly #queryParamsService = inject(QueryParamsService);
  readonly #viewModeService = inject(ViewModeService);
  readonly filtersService = inject(CatalogFiltersService);

  readonly viewMode = this.#viewModeService.viewMode;
  readonly catalogTrackBy = (item: ICatalogItem) => item.id;

  readonly getSeverity = getPropertyStatusSeverity;
  statuses: { label: string; value: string }[] = [];

  actionItems: MenuItem[] = [];

  selectedItems: ICatalogItem[] = [];

  readonly tableDataS = this.#store.selectSignal(CatalogState.catalog);
  readonly paginationS = this.#store.selectSignal(CatalogState.pagination);
  readonly loadingS = this.#store.selectSignal(CatalogState.loading);

  ViewMode = ViewMode;

  ngAfterViewInit(): void {
    const table = this.pTable();
    if (table) {
      const pagination = this.paginationS();
      table.first = pagination.first;
      table.rows = pagination.rows;
    }

    this.#initPropsTranlstes();
  }

  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  onSearch(query: string): void {
    this.#store.dispatch([new SetCatalogSearch(query), new FetchCatalog()]);
  }

  onStatusChange(newStatus: PropertyStatus, id: number): void {
    const tableItems = this.tableDataS().items;
    const currentItem = tableItems.find(item => item.id === id);

    if (!currentItem || currentItem.status === newStatus) return;

    this.#store.dispatch(new UpdateStatus(id, newStatus, { getList: true }));
  }

  #setActionItems(item: ICatalogItem): void {
    this.actionItems = [
      {
        label: this.#translateService.instant('CATALOG.TABLE.BUTTONS.ADD_TO_LISTING'),
        icon: 'pi pi-list-check',
        command: () => this.openAddToListingDialog(item.id),
      },
      {
        label: this.#translateService.instant('ACTIONS.EDIT'),
        icon: 'pi pi-pencil',
        command: () => this.openItemDialog(item.id),
      },
      {
        separator: true,
      },
      {
        label: this.#translateService.instant('ACTIONS.DELETE'),
        icon: 'pi pi-trash',
        command: () => this.deleteItems([item]),
      },
    ];
  }

  onActionClick(event: Event, item: ICatalogItem): void {
    this.#setActionItems(item);
    this.menu().toggle(event);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (typeof event.sortField === 'string' && typeof event.sortOrder === 'number') {
      const sort = { sortField: event.sortField, sortOrder: event.sortOrder === 1 ? 'asc' : 'desc' };
      this.#store.dispatch([new SetCatalogSort(sort), new FetchCatalog()]);
    }

    // Используется, чтобы перебить переключение пагинации при сортировке
    const table = this.pTable();
    if (table) {
      const pagination = this.paginationS();
      table.first = pagination.first;
      table.rows = pagination.rows;
    }
  }

  pageChange(event: TablePageEvent): void {
    this.#queryParamsService.updateQueryParams(event, CATALOG_PAGINATION_KEY);
    this.#store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  onCardsPageChange(event: PaginatorState): void {
    const pagination = { first: event.first ?? 0, rows: event.rows ?? 20 };
    this.#queryParamsService.updateQueryParams(pagination, CATALOG_PAGINATION_KEY);
    this.#store.dispatch([new SetCatalogPagination(pagination), new FetchCatalog()]);
  }

  toggleViewMode(): void {
    this.#viewModeService.toggle();
  }

  onFiltersOpen(): void {
    this.filtersService.openFilters();
  }

  openItemDialog(id?: number): void {
    if (id === undefined || id < 0) {
      this.openDialog();
      return;
    }

    this.#store
      .dispatch(new FetchPropertyObject(id))
      .pipe(
        tap(() => {
          const propertyData = this.#store.selectSnapshot(CatalogState.propertyObject);
          if (propertyData) {
            this.openDialog(propertyData);
          } else {
            this.openDialog();
          }
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  openAddToListingDialog(id: number): void {
    this.#ref = this.#dialogService.open(AddToListingComponent, {
      data: id,
      header: this.#translateService.instant('LISTINGS.ACTIONS.ADD_OBJECT'),
      width: '370px',
      height: '300px',
      dismissableMask: true,
      modal: true,
      closable: true,
      focusOnShow: false,
      draggable: false,
    });
  }

  openDialog(data?: IPropertyObject): void {
    this.#ref = this.#dialogService.open(CreateCatalogItemComponent, {
      data: data,
      header: this.#translateService.instant(data?.id ? 'CATALOG.TABLE.DIALOG.EDIT' : 'CATALOG.TABLE.DIALOG.ADD'),
      width: '50vw',
      modal: true,
      closable: true,
      dismissableMask: true,
      draggable: false,
      focusOnShow: false,
      breakpoints: {
        '960px': '75vw',
        '768px': '90vw',
        '640px': '95vw',
      },
    });

    this.#ref?.onClose
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        switchMap(() => this.#store.dispatch(new FetchCatalog())),
      )
      .subscribe();
  }

  deleteItems(items: ICatalogItem[]): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(
        new DeletePropertyObjects(
          items.map(item => item.id),
          { getList: true },
        ),
      );
      this.selectedItems = [];
    });
  }

  #initPropsTranlstes(): void {
    this.#translateService.onLangChange.pipe(startWith(null), takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      this.statuses = mapEnumToOptions(PropertyStatus, value =>
        this.#translateService.instant(`FORM.PROPERTIES.PROPERTY_STATUS.${value}`),
      );
    });
  }

  ngOnDestroy(): void {
    if (this.#ref) {
      this.#ref.close();
    }
  }
}
