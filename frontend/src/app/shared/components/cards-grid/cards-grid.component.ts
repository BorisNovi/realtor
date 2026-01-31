import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, inject, input, output, TemplateRef } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { ViewModeService } from 'src/app/core';

@Component({
  selector: 'rx-cards-grid',
  imports: [CardModule, PaginatorModule, ProgressBarModule, ButtonModule, TooltipModule, TranslatePipe, NgTemplateOutlet],
  templateUrl: './cards-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host ::ng-deep {
      .p-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .p-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .p-card-footer {
        margin-top: auto;
      }
    }
  `,
})
export class CardsGridComponent<T> {
  readonly items = input.required<T[]>();
  readonly totalRecords = input.required<number>();
  readonly first = input.required<number>();
  readonly rows = input.required<number>();
  readonly loading = input(false);
  readonly emptyText = input('');
  readonly currentPageReportTemplate = input('');
  readonly trackBy = input.required<(item: T) => unknown>();

  readonly pageChange = output<PaginatorState>();

  readonly cardTemplate = contentChild.required<TemplateRef<unknown>>('card');
  readonly captionTemplate = contentChild<TemplateRef<unknown>>('caption');
  readonly emptyTemplate = contentChild<TemplateRef<unknown>>('empty');

  readonly #viewModeService = inject(ViewModeService);
  readonly viewMode = this.#viewModeService.viewMode;

  toggleViewMode(): void {
    this.#viewModeService.toggle();
  }

  onPageChange(event: PaginatorState): void {
    this.pageChange.emit(event);
  }
}
