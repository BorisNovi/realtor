import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ICatalogItem } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { Store } from '@ngxs/store';
import { CatalogState, DeletePropertyObjects, FetchCatalog, SetCatalogPagination } from 'src/app/core';
import { Menu, MenuModule } from 'primeng/menu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { PropertyStatus } from '@shared/enums';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { getPropertyStatusSeverity } from '@shared/utils';

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    TagModule,
    ButtonModule,
    CommonModule,
    ButtonGroupModule,
    MenuModule,
    ConfirmDialog,
    DynamicDialogModule,
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

  public readonly getSeverity = getPropertyStatusSeverity;

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
          console.log(`Edit item with id: ${item.id}`);
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
    console.log(this.tableDataS(), 'd');
    this.filtersOpen.emit();
  }

  public openItemDialog(): void {
    this.ref = this.dialogService.open(CreateCatalogItemComponent, {
      header: 'Add new item',
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

    this.ref.onClose.subscribe((data: any) => {
      let summary_and_detail;
      if (data) {
        const buttonType = data?.buttonType;
        summary_and_detail = buttonType
          ? { summary: 'No Product Selected', detail: `Pressed '${buttonType}' button` }
          : { summary: 'Product Selected', detail: data?.name };
      } else {
        summary_and_detail = { summary: 'No Product Selected', detail: 'Pressed Close button' };
      }
      // this.messageService.add({ severity: 'info', ...summary_and_detail, life: 3000 });
    });

    this.ref.onMaximize.subscribe(value => {
      // this.messageService.add({ severity: 'info', summary: 'Maximized', detail: `maximized: ${value.maximized}` });
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
