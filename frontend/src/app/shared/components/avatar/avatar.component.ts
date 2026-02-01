import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'src/app/core';

@Component({
  selector: 'rx-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvatarComponent),
      multi: true,
    },
  ],
})
export class AvatarComponent implements ControlValueAccessor {
  readonly #fileUploadService = inject(FileUploadService);
  readonly #translateService = inject(TranslateService);
  readonly #destroyRef = inject(DestroyRef);

  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly maxFileSize = input<number>(1000000);
  readonly readonly = input(false, { transform: booleanAttribute });

  readonly imageUrl = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly isDragOver = signal<boolean>(false);

  #onChange: (value: string | null) => void = () => {};
  #onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.imageUrl.set(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  onContainerClick(): void {
    if (this.readonly()) return;
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.#uploadFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.readonly()) this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (this.readonly()) return;

    const file = event.dataTransfer?.files?.[0];
    if (file) this.#uploadFile(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.imageUrl.set(null);
    this.#onChange(null);
    this.#onTouched();
  }

  #uploadFile(file: File): void {
    this.error.set(null);

    if (!file.type.startsWith('image/')) {
      this.error.set(this.#translateService.instant('FILE_UPLOAD.ERRORS.INVALID_TYPE'));
      return;
    }

    if (file.size > this.maxFileSize()) {
      this.error.set(
        this.#translateService.instant('FILE_UPLOAD.ERRORS.FILE_TOO_LARGE', {
          size: this.maxFileSize() / 1000000,
        }),
      );
      return;
    }

    this.isLoading.set(true);

    this.#fileUploadService
      .upload([file])
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (urls: string[]) => {
          const url = urls[0];
          this.imageUrl.set(url);
          this.#onChange(url);
          this.#onTouched();
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(this.#translateService.instant('FILE_UPLOAD.ERRORS.UPLOAD_FAILED'));
          this.isLoading.set(false);
        },
      });
  }
}
