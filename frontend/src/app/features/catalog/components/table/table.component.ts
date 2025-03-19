import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { ICatalogItem, IPagination, ITableData } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { Store } from '@ngxs/store';
import { CatalogState, FetchCatalog, SetCatalogPagination } from 'src/app/core';

@Component({
  selector: 'app-table',
  imports: [TableModule, TagModule, ButtonModule, CommonModule, ButtonGroupModule],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements AfterViewInit {
  @ViewChild('pTable') pTable!: Table;

  @Output() filtersOpen = new EventEmitter<void>();

  private readonly store = inject(Store);

  public selectedItems: ICatalogItem[] = [];

  public tableDataS = this.store.selectSignal(CatalogState.catalog);
  public paginationS = this.store.selectSignal(CatalogState.pagination);
  public loadingS = this.store.selectSignal(CatalogState.loading);

  public ngAfterViewInit(): void {
    const pagination = this.paginationS();
    this.pTable.first = pagination.first;
    this.pTable.rows = pagination.rows;
  }

  public getSeverity(status: string) {
    switch (status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'warn';
      case 'reserved':
        return 'danger';
      default:
        return 'info';
    }
  }

  public pageChange(event: TablePageEvent) {
    this.store.dispatch([new SetCatalogPagination(event), new FetchCatalog()]);
  }

  public openActions(item: ICatalogItem): void {
    console.log('actions with', item);
  }

  public onFiltersOpen(): void {
    this.filtersOpen.emit();
  }
}
