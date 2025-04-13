import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { ICatalogItem, IPropertyObject } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { Table, TableEditCompleteEvent, TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { Store } from '@ngxs/store';
import {
  CatalogState,
  DeletePropertyObjects,
  FetchCatalog,
  FetchPropertyObject,
  SetCatalogPagination,
  UpdateStatus,
} from 'src/app/core';
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
  ],
  providers: [DialogService],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pTable') pTable!: Table;
  @ViewChild('menu') menu!: Menu;

  @Output() filtersOpen = new EventEmitter<void>();

  private ref: DynamicDialogRef | undefined;
  private readonly dialogService = inject(DialogService);
  private readonly store = inject(Store);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly getSeverity = getPropertyStatusSeverity;
  public readonly getStatusBackground = getPropertyStatusBackground;
  public statuses = mapEnumToOptions(PropertyStatus);

  public actionItems: MenuItem[] = [];

  public selectedItems: ICatalogItem[] = [];

  public tableDataS = this.store.selectSignal(CatalogState.catalog);
  public paginationS = this.store.selectSignal(CatalogState.pagination);
  public loadingS = this.store.selectSignal(CatalogState.loading);

  public ngAfterViewInit(): void {
    const pagination = this.paginationS();
    this.pTable.first = pagination.first;
    this.pTable.rows = pagination.rows;
  }

  public onEditComplete(event: TableEditCompleteEvent): void {
    const { id, value: status } = event.data;
  }

  public onStatusChange(newStatus: PropertyStatus, id: number): void {
    const tableItems = this.tableDataS().items;
    const currentItem = tableItems[id];

    if (!currentItem || currentItem.status === newStatus) return;

    this.store.dispatch(new UpdateStatus(id, newStatus));
  }

  public setActionItems(event: Event, item: ICatalogItem): void {
    this.actionItems = [
      {
        label: 'Add to listing',
        icon: 'pi pi-list-check',
        command: () => {
          console.log(`Add to listing item with id: ${item.id}`);
        },
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.openItemDialog(item.id);
        },
      },
      {
        separator: true,
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.confirmDeletion(event, item);
        },
      },
    ];
  }

  public onActionClick(event: Event, item: ICatalogItem): void {
    this.setActionItems(event, item);
    this.menu.toggle(event);
  }

  public pageChange(event: TablePageEvent): void {
    this.store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  public onFiltersOpen(): void {
    this.filtersOpen.emit();
  }

  public openItemDialog(id?: number): void {
    if (id === undefined || id < 0) {
      this.openDialog();
      return;
    }

    this.store
      .dispatch(new FetchPropertyObject(id))
      .pipe(
        tap(() => {
          const propertyData = this.store.selectSnapshot(CatalogState.propertyObject);
          if (propertyData) {
            this.openDialog(propertyData);
          } else {
            this.openDialog();
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  public openDialog(data?: IPropertyObject): void {
    this.ref = this.dialogService.open(CreateCatalogItemComponent, {
      data: data,
      header: data?.id ? 'Edit Item' : 'Add New Item',
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

    this.ref.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: IPropertyObject) => {
      console.log('data on close dialog', data);
    });
  }

  public confirmDeletion(event: Event, item: ICatalogItem): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Attention! You won't restore it!",
      header: 'Delete item?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },

      accept: () => {
        this.store.dispatch(new DeletePropertyObjects([item.id]));
      },
    });
  }

  public ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
  }
}
