import { CommonModule } from '@angular/common';
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
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency, PropertyStatus } from '@shared/enums';
import { ICatalogItem, IPagination, IPropertyObject } from '@shared/interfaces';
import { getPropertyStatusBackground, getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { Table, TableEditCompleteEvent, TableLazyLoadEvent, TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { startWith, tap } from 'rxjs';
import {
  CatalogState,
  DeletePropertyObjects,
  DeletionConfirmationService,
  FetchPropertyObject,
  UpdateStatus,
} from 'src/app/core';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';

@Component({
  selector: 'rx-table',
  imports: [
    FormsModule,
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
  ],
  providers: [DialogService],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements AfterViewInit, OnDestroy {
  readonly pTable = viewChild.required<Table>('pTable');
  readonly menu = viewChild.required<Menu>('menu');
  readonly filtersCount = input<number>();

  readonly filtersOpen = output();
  readonly paginationChange = output<IPagination>();
  readonly sortChange = output<{ sortField: string; sortOrder: string }>();

  #ref!: DynamicDialogRef | null;
  readonly #dialogService = inject(DialogService);
  readonly #store = inject(Store);
  readonly #confirmationService = inject(ConfirmationService);
  readonly #translateService = inject(TranslateService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;
  statuses: { label: string; value: string }[] = [];

  actionItems: MenuItem[] = [];

  selectedItems: ICatalogItem[] = [];

  readonly tableDataS = this.#store.selectSignal(CatalogState.catalog);
  readonly paginationS = this.#store.selectSignal(CatalogState.pagination);
  readonly loadingS = this.#store.selectSignal(CatalogState.loading);

  ngAfterViewInit(): void {
    const pagination = this.paginationS();
    this.pTable().first = pagination.first;
    this.pTable().rows = pagination.rows;

    this.#initPropsTranlstes();
  }

  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  onEditComplete(event: TableEditCompleteEvent): void {
    const { id, value: status } = event.data;
  }

  onStatusChange(newStatus: PropertyStatus, id: number): void {
    const tableItems = this.tableDataS().items;
    const currentItem = tableItems.find(item => item.id === id);

    if (!currentItem || currentItem.status === newStatus) return;

    this.#store.dispatch(new UpdateStatus(id, newStatus));
  }

  #setActionItems(item: ICatalogItem): void {
    this.actionItems = [
      {
        label: this.#translateService.instant('CATALOG.TABLE.BUTTONS.ADD_TO_LISTING'),
        icon: 'pi pi-list-check',
        command: () => {
          // TODO: на этапе подборок это реализуется
          console.debug(`Add to listing item with id: ${item.id}`);
        },
      },
      {
        label: this.#translateService.instant('CATALOG.TABLE.ACTIONS.EDIT'),
        icon: 'pi pi-pencil',
        command: () => {
          this.openItemDialog(item.id);
        },
      },
      {
        separator: true,
      },
      {
        label: this.#translateService.instant('CATALOG.TABLE.ACTIONS.DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          this.deleteItems([item]);
        },
      },
    ];
  }

  onActionClick(event: Event, item: ICatalogItem): void {
    this.#setActionItems(item);
    this.menu().toggle(event);
  }

  onRowClick(item: ICatalogItem): void {
    this.#router.navigate(['catalog', item.id]);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (typeof event.sortField === 'string' && typeof event.sortOrder === 'number') {
      this.sortChange.emit({ sortField: event.sortField, sortOrder: event.sortOrder === 1 ? 'asc' : 'desc' });
    }

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

  openDialog(data?: IPropertyObject): void {
    this.#ref = this.#dialogService.open(CreateCatalogItemComponent, {
      data: data,
      header: this.#translateService.instant(data?.id ? 'CATALOG.TABLE.DIALOG.EDIT' : 'CATALOG.TABLE.DIALOG.ADD'),
      width: '50vw',
      modal: true,
      closable: true,
      focusOnShow: false,
      breakpoints: {
        '960px': '75vw',
        '768px': '90vw',
        '640px': '95vw',
      },
    });
  }

  deleteItems(items: ICatalogItem[]): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new DeletePropertyObjects(items.map(item => item.id)));
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
