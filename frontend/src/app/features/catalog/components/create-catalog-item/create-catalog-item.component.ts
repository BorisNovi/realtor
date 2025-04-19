import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import {
  PropertyType,
  PropertyStatus,
  Currency,
  ZoningType,
  FurnishedStatus,
  RenovationStatus,
  KitchenType,
} from '@shared/enums';
import { getPropertyStatusSeverity, getPropertyStatusBackground, fileToBase64, mapEnumToOptions } from '@shared/utils';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { CreatePropertyObject, FileUploadService } from 'src/app/core';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { IPropertyObject } from '@shared/interfaces';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { WorldPhoneMasksDirective } from '@shared/directives';

@Component({
  imports: [
    CommonModule,
    FileUploadModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TagModule,
    DividerModule,
    TextareaModule,
    Checkbox,
    InputGroupModule,
    InputGroupAddonModule,
    WorldPhoneMasksDirective,
    MessageModule,
  ],
  templateUrl: './create-catalog-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlide', [
      state('void', style({ opacity: 0, height: '0px', marginBottom: '0' })),
      state('*', style({ opacity: 1, height: '*', marginBottom: '*' })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
  ],
})
export class CreateCatalogItemComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fileUploadService = inject(FileUploadService);

  public readonly getSeverity = getPropertyStatusSeverity;
  public readonly getStatusBackground = getPropertyStatusBackground;

  public form!: FormGroup;

  public photosS = signal<string[]>([]);
  public uploadErrorS = signal<string | null>(null);

  public propertyTypes = mapEnumToOptions(PropertyType);
  public statuses = mapEnumToOptions(PropertyStatus);
  public zoningTypes = mapEnumToOptions(ZoningType);
  public furnishedStatuses = mapEnumToOptions(FurnishedStatus);
  public renovationStatuses = mapEnumToOptions(RenovationStatus);
  public kitchenTypes = mapEnumToOptions(KitchenType);
  public currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);

  public getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  public isCommentVisible = !!this.config.data?.comment || false;
  public isAdditionalParamsVisible = !!this.config.data?.specifies || false;

  public ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const data = this.config.data;

    this.form = this.fb.group({
      photos: [data?.photos || null],
      propertyType: [data?.propertyType || null, Validators.required],
      zoningType: [data?.zoningType || null, Validators.required],
      status: [data?.status || null, Validators.required],
      mapLink: [data?.mapLink || null],
      address: [data?.address || null, Validators.required],
      area: [data?.area || null, [Validators.required, Validators.min(1)]],

      price: this.fb.group({
        value: [data?.price?.value || null, [Validators.required, Validators.min(0)]],
        currency: [data?.price?.currency || null, Validators.required],
      }),

      contact: this.fb.group({
        name: [data?.contact?.name || null],
        phone: [data?.contact?.phone || null],
      }),

      comment: [data?.comment || null],

      specifies: this.fb.group({
        rooms: [data?.specifies?.rooms || null, [Validators.min(1), Validators.max(200)]],
        floor: this.fb.group({
          current: [data?.specifies?.floor?.current || null, [Validators.min(-10), Validators.max(200)]],
          full: [data?.specifies?.floor?.full || null, Validators.min(1)],
        }),
        kitchen: [data?.specifies?.kitchen || null],
        furnished: [data?.specifies?.furnished || null],
        renovation: [data?.specifies?.renovation || null],

        sharedFacilities: this.fb.group({
          kitchen: [data?.specifies?.sharedFacilities?.kitchen || false],
          bathroom: [data?.specifies?.sharedFacilities?.bathroom || false],
        }),

        utilities: this.fb.group({
          electricity: [data?.specifies?.utilities?.electricity || false],
          waterSupply: [data?.specifies?.utilities?.waterSupply || false],
          naturalGas: [data?.specifies?.utilities?.naturalGas || false],
          sewerage: [data?.specifies?.utilities?.sewerage || false],
          heating: [data?.specifies?.utilities?.heating || null],
          internet: [data?.specifies?.utilities?.internet || false],
        }),

        // Other
        parking: [data?.specifies?.parking || false],
        bath: [data?.specifies?.bath || false],
        shower: [data?.specifies?.shower || false],
        airConditioning: [data?.specifies?.airConditioning || false],
        fireplace: [data?.specifies?.fireplace || false],
        beautifulView: [data?.specifies?.beautifulView || false],
        newBuilding: [data?.specifies?.newBuilding || false],
        elevator: [data?.specifies?.elevator || false],
        balcony: [data?.specifies?.balcony || false],
        garden: [data?.specifies?.garden || false],
        garage: [data?.specifies?.garage || false],
      }),
    });

    this.photosS.set(data?.photos || []);
  }

  public choose(callback: VoidFunction): void {
    callback();
    this.uploadErrorS.set(null);
  }

  public onUpload(event: FileUploadHandlerEvent): void {
    if (event && Array.isArray(event.files)) {
      const files: File[] = event.files;

      this.fileUploadService
        .upload(files)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (newUrls: string[]) => {
            this.photosS.update(currentUrls => [...currentUrls, ...newUrls]);
            this.form.patchValue({ photos: this.photosS() });
            this.fileUpload.clear();
            this.uploadErrorS.set(null);
          },
          error: err => {
            const errorMessage = err?.error?.message || 'File upload failed';
            this.uploadErrorS.set(errorMessage);
            console.error('File upload failed:', err);
          },
        });
    }
  }

  public removePhoto(index: number): void {
    this.photosS.update(currentUrls => {
      const updated = [...currentUrls];
      updated.splice(index, 1);
      return updated;
    });
    this.form.patchValue({ photos: this.photosS() });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      const payload = {
        ...formData,
        contact: { name: formData.contact.name, phone: formData.contact.phone.replace(/\D/g, '') },
      };

      this.store
        .dispatch(new CreatePropertyObject(payload))
        .pipe(
          tap(() => this.ref.close(payload)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    } else {
      this.form.markAllAsTouched();
    }
  }

  public onCancel(): void {
    this.ref.close();
  }

  public toggleComment(): void {
    this.isCommentVisible = !this.isCommentVisible;
  }

  public toggleAdditionalParams(): void {
    this.isAdditionalParamsVisible = !this.isAdditionalParamsVisible;
  }
}
