import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { IImportExportSection, ImportExportFormat } from '@shared/interfaces';
import { ImportExportService } from 'src/app/core/services/import-export.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FileUploadProgressComponent, UploadStatus } from '../file-upload-progress/file-upload-progress.component';

interface IEntityState {
  status: UploadStatus;
  progress: number;
}

const FORMAT_ACCEPT: Record<ImportExportFormat, string> = {
  csv: '.csv,text/csv',
  xlsx: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xml: '.xml,text/xml,application/xml',
};

@Component({
  selector: 'rx-import-export',
  imports: [ButtonModule, DividerModule, TranslatePipe, FileUploadProgressComponent],
  templateUrl: './import-export.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportExportComponent {
  readonly #importExportService = inject(ImportExportService);
  readonly #destroyRef = inject(DestroyRef);

  readonly sections = input<IImportExportSection[]>([]);

  readonly #states = new Map<string, ReturnType<typeof signal<IEntityState>>>();

  getState(entityId: string): IEntityState {
    return this.#getOrCreateState(entityId)();
  }

  buildAccept(formats: ImportExportFormat[]): string {
    return formats.map(f => FORMAT_ACCEPT[f]).join(',');
  }

  triggerImport(section: IImportExportSection): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = this.buildAccept(section.formats);
    fileInput.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.#startImport(file, section);
    };
    fileInput.click();
  }

  exportFile(section: IImportExportSection): void {
    const ext = section.formats[0];
    const filename = `${section.entityId}-export-${new Date().toISOString().slice(0, 10)}.${ext}`;

    this.#importExportService
      .export(section.exportEndpoint)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = filename;
          anchor.click();
          URL.revokeObjectURL(url);
        },
      });
  }

  #startImport(file: File, section: IImportExportSection): void {
    const state = this.#getOrCreateState(section.entityId);
    state.set({ status: 'uploading', progress: 0 });

    this.#importExportService
      .import(file, section.importEndpoint)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            state.set({ status: 'uploading', progress: Math.round((event.loaded / event.total) * 100) });
          } else if (event.type === HttpEventType.Response) {
            state.set({ status: 'success', progress: 100 });
            setTimeout(() => state.set({ status: 'idle', progress: 0 }), 3000);
          }
        },
        error: () => {
          state.set({ status: 'error', progress: 0 });
          setTimeout(() => state.set({ status: 'idle', progress: 0 }), 3000);
        },
      });
  }

  #getOrCreateState(entityId: string): ReturnType<typeof signal<IEntityState>> {
    if (!this.#states.has(entityId)) {
      this.#states.set(entityId, signal<IEntityState>({ status: 'idle', progress: 0 }));
    }
    return this.#states.get(entityId)!;
  }
}
