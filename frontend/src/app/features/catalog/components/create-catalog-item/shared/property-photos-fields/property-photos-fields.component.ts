import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { FileUploadService } from 'src/app/core';

@Component({
  selector: 'rx-property-photos-fields',
  templateUrl: './property-photos-fields.component.html',
  host: { class: 'md:col-span-2' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FileUploadModule, ButtonModule, MessageModule, TranslatePipe],
})
export class PropertyPhotosFieldsComponent implements OnInit {
  // Контрол photos из родительской FormGroup — компонент обновляет его напрямую
  readonly control = input.required<AbstractControl>();

  readonly #fileUploadService = inject(FileUploadService);
  readonly #translateService = inject(TranslateService);
  readonly #destroyRef = inject(DestroyRef);

  readonly fileUpload = viewChild.required<FileUpload>('fileUpload');

  readonly photosS = signal<string[]>([]);
  readonly uploadErrorS = signal<string | null>(null);
  readonly maxImageSize = 10_485_760; // 10 MB
  readonly imagesLimit = 25;

  ngOnInit(): void {
    this.photosS.set(this.control().value ?? []);
  }

  choose(callback: VoidFunction): void {
    callback();
    this.uploadErrorS.set(null);
  }

  onUpload(event: FileUploadHandlerEvent): void {
    if (!Array.isArray(event.files)) return;

    const oversized = event.files.filter(f => f.size > this.maxImageSize);
    const validFiles = event.files.filter(f => f.size <= this.maxImageSize);

    if (oversized.length > 0) {
      const sizeMb = this.maxImageSize / 1024 / 1024;
      this.uploadErrorS.set(this.#translateService.instant('FILE_UPLOAD.ERRORS.FILE_TOO_LARGE', { size: sizeMb }));
      this.fileUpload().clear();
    }

    if (validFiles.length === 0) return;

    this.#fileUploadService
      .upload(validFiles)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (newUrls: string[]) => {
          this.photosS.update(current => [...current, ...newUrls]);
          this.control().setValue(this.photosS());
          this.fileUpload().clear();
          if (oversized.length === 0) this.uploadErrorS.set(null);
        },
        error: () => {
          this.uploadErrorS.set(this.#translateService.instant('FILE_UPLOAD.ERRORS.UPLOAD_FAILED'));
          this.fileUpload().clear();
        },
      });
  }

  removePhoto(index: number): void {
    this.photosS.update(current => {
      const updated = [...current];
      updated.splice(index, 1);
      return updated;
    });
    this.control().setValue(this.photosS());
  }
}
