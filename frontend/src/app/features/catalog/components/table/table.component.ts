import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import { ICatalogItem, IPagination, IPropertyObject } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { Table, TableEditCompleteEvent, TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { Store } from '@ngxs/store';
import { CatalogState, DeletePropertyObjects, FetchPropertyObject, UpdateStatus } from 'src/app/core';
import { Menu, MenuModule } from 'primeng/menu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { PropertyStatus } from '@shared/enums';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { getPropertyStatusBackground, getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-table',
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
    TranslatePipe,
  ],
  providers: [DialogService],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pTable') pTable!: Table;
  @ViewChild('menu') menu!: Menu;

  readonly filtersOpen = output();
  readonly paginationChange = output<IPagination>();

  #ref: DynamicDialogRef | undefined;
  readonly #dialogService = inject(DialogService);
  readonly #store = inject(Store);
  readonly #confirmationService = inject(ConfirmationService);
  readonly #translateService = inject(TranslateService);
  readonly #destroyRef = inject(DestroyRef);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;
  statuses = mapEnumToOptions(PropertyStatus);

  actionItems: MenuItem[] = [];

  selectedItems: ICatalogItem[] = [];

  readonly tableDataS = this.#store.selectSignal(CatalogState.catalog);
  readonly paginationS = this.#store.selectSignal(CatalogState.pagination);
  readonly loadingS = this.#store.selectSignal(CatalogState.loading);

  ngAfterViewInit(): void {
    const pagination = this.paginationS();
    this.pTable.first = pagination.first;
    this.pTable.rows = pagination.rows;
  }

  onEditComplete(event: TableEditCompleteEvent): void {
    const { id, value: status } = event.data;
  }

  onStatusChange(newStatus: PropertyStatus, id: number): void {
    const tableItems = this.tableDataS().items;
    const currentItem = tableItems[id];

    if (!currentItem || currentItem.status === newStatus) return;

    this.#store.dispatch(new UpdateStatus(id, newStatus));
  }

  setActionItems(event: Event, item: ICatalogItem): void {
    this.actionItems = [
      {
        label: this.#translateService.instant('CATALOG.TABLE.BUTTONS.ADD_TO_LISTING'),
        icon: 'pi pi-list-check',
        command: () => {
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
          this.confirmDeletion(event, item);
        },
      },
    ];
  }

  onActionClick(event: Event, item: ICatalogItem): void {
    this.setActionItems(event, item);
    this.menu.toggle(event);
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
      contentStyle: { overflow: 'auto' },
      focusOnShow: false,
      breakpoints: {
        '960px': '75vw',
        '768px': '90vw',
        '640px': '95vw',
      },
    });

    this.#ref.onClose.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((data: IPropertyObject) => {
      console.debug('data on close dialog', data);
    });
  }

  confirmDeletion(event: Event, item: ICatalogItem): void {
    this.#confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.#translateService.instant('CATALOG.TABLE.DIALOG.DELETE_HINT'),
      header: this.#translateService.instant('CATALOG.TABLE.DIALOG.DELETE_REQUEST'),
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: this.#translateService.instant('CATALOG.TABLE.DIALOG.CANCEL'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.#translateService.instant('CATALOG.TABLE.ACTIONS.DELETE'),
        severity: 'danger',
      },

      accept: () => {
        this.#store.dispatch(new DeletePropertyObjects([item.id]));
      },
    });
  }

  ngOnDestroy(): void {
    if (this.#ref) {
      this.#ref.close();
    }
  }
}
