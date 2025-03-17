import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ICatalogItem, ITableData } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonGroupModule } from 'primeng/buttongroup';

@Component({
  selector: 'app-table',
  imports: [TableModule, TagModule, ButtonModule, CommonModule, ButtonGroupModule],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  @Input() tableData?: ITableData<ICatalogItem>;
  @Output() filtersOpen = new EventEmitter<void>();

  public selectedItems: ICatalogItem[] = [];

  getSeverity(status: string) {
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

  pageChange(event: any) {
    console.log(event);
  }

  openActions(item: ICatalogItem): void {
    console.log('actions with', item);
  }

  onFiltersOpen(): void {
    this.filtersOpen.emit();
  }
}
