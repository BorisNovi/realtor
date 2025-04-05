import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
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
import { CreatePropertyObject } from 'src/app/core';
import { pipe, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { IPropertyObject } from '@shared/interfaces';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

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
export class CreateCatalogItemComponent implements OnInit, AfterViewInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  private readonly ref = inject(DynamicDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public readonly getSeverity = getPropertyStatusSeverity;
  public readonly getStatusBackground = getPropertyStatusBackground;

  public form!: FormGroup;
  public uploadedFiles: File[] = [];

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

  public isCommentVisible = false;
  public isAdditionalParamsVisible = false;

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
    this.form = this.fb.group({
      photos: [null], // string[]
      propertyType: [null, Validators.required],
      zoningType: [null, Validators.required],
      status: [null, Validators.required],
      mapLink: [''],
      address: ['', Validators.required],
      area: [null, [Validators.required, Validators.min(1)]],
      dateAdded: [new Date()],

      price: this.fb.group({
        value: [null, [Validators.required, Validators.min(0)]],
        currency: ['', Validators.required],
      }),

      comment: [''],

      specifies: this.fb.group({
        rooms: [null, [Validators.min(1), Validators.max(200)]],
        floor: this.fb.group({
          current: [null, [Validators.min(-10), Validators.max(200)]],
          full: [null, Validators.min(1)],
        }),
        kitchen: [null],
        furnished: [null],
        renovation: [null],

        sharedFacilities: this.fb.group({
          kitchen: [false],
          bathroom: [false],
        }),

        utilities: this.fb.group({
          electricity: [false],
          waterSupply: [false],
          naturalGas: [false],
          sewerage: [false],
          heating: [null],
          internet: [false],
        }),

        // Other
        parking: [false],
        bath: [false],
        shower: [false],
        airConditioning: [false],
        fireplace: [false],
        beautifulView: [false],
        newBuilding: [false],
        elevator: [false],
        balcony: [false],
        garden: [false],
        garage: [false],
      }),
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

      this.form.patchValue({ photos: photosBase64 });
      this.form.get('photos')?.updateValueAndValidity();
    } else {
      this.form.patchValue({ photos: [] });
    }
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;

      this.store
        .dispatch(new CreatePropertyObject(formData))
        .pipe(
          tap(() => this.ref.close(formData)),
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
