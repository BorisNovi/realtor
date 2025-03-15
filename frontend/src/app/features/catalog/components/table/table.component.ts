import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ICatalogData } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-table',
  imports: [TableModule, TagModule, ButtonModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  @Input() tableData?: ICatalogData[];

  public selectedItems!: ICatalogData[];

  getSeverity(status: string) {
    switch (status) {
      case 'Avaliable':
        return 'success';
      case 'Rented':
        return 'warn';
      case 'Reserved':
        return 'danger';
      default:
        return 'info';
    }
  }

  pageChange(event: any) {
    console.log(event);
  }

  openActions(item: ICatalogData): void {
    console.log('actions with', item);
  }
}
