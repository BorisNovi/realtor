import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { PropertyType, PropertyStatus } from '@shared/enums';
import { getPropertyStatusSeverity, fileToBase64 } from '@shared/utils';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { CreatePropertyObject } from 'src/app/core';
import { pipe, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [CommonModule, FileUploadModule, ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, TagModule],
  templateUrl: './create-catalog-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCatalogItemComponent implements OnInit, AfterViewInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  private readonly ref = inject(DynamicDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public readonly getSeverity = getPropertyStatusSeverity;
  public catalogForm!: FormGroup;
  public uploadedFiles: File[] = [];

  public propertyTypes = [
    { label: 'Flat', value: PropertyType.flat },
    { label: 'House', value: PropertyType.house },
    { label: 'Room', value: PropertyType.room },
  ];

  public statuses = [
    { label: 'Available', value: PropertyStatus.available },
    { label: 'Reserved', value: PropertyStatus.reserved },
    { label: 'Rented', value: PropertyStatus.rented },
  ];

  public ngOnInit(): void {
    this.initForm();
  }

  public ngAfterViewInit(): void {
    if (this.fileUpload) {
      // this.fileUpload._files.push(this.file);
      // this.fileUpload.cd.detectChanges();
      // this.cdr.detectChanges();
    }
  }

  private initForm(): void {
    this.catalogForm = this.fb.group({
      photos: [null],
      propertyType: [null, Validators.required],
      status: [null, Validators.required],
      mapLink: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      currency: ['', Validators.required],
      area: [null, [Validators.required, Validators.min(1)]],
      rooms: [null, [Validators.required, Validators.min(1), Validators.max(200)]],
      currentFloor: [null, [Validators.min(-10), Validators.max(200)]],
      totalFloors: [null, Validators.min(1)],
      address: ['', Validators.required],
    });
  }

  public async onUpload(event: FileUploadHandlerEvent): Promise<void> {
    if (event && Array.isArray(event.files)) {
      const photosBase64 = await Promise.all(
        event.files.map((file: File) =>
          fileToBase64(file).then(base64 => ({
            name: file.name,
            content: base64,
          })),
        ),
      );

      this.catalogForm.patchValue({ photos: photosBase64 });
      this.catalogForm.get('photos')?.updateValueAndValidity();
    } else {
      this.catalogForm.patchValue({ photos: [] });
    }
  }

  public onSubmit(): void {
    if (this.catalogForm.valid) {
      const formData = this.catalogForm.value;

      this.store
        .dispatch(new CreatePropertyObject(formData))
        .pipe(
          tap(() => this.ref.close(formData)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    } else {
      this.catalogForm.markAllAsTouched();
    }
  }

  public onCancel(): void {
    this.ref.close();
  }
}
