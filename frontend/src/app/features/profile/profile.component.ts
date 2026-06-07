import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { AvatarComponent, ImportExportComponent, InputWrapperComponent, SelectSingleComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { WorldPhoneMasksDirective } from '@shared/directives';
import { Currency } from '@shared/enums';
import { ICountry, IFetchOptions, IImportExportSection, IUser } from '@shared/interfaces';
import { mapEnumToOptions } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { FluidModule } from 'primeng/fluid';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { catchError, filter, map, of } from 'rxjs';
import { CountryService, EditProfile, FileUploadService, Logout, ProfileState, Terminate } from 'src/app/core';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { DeleteAccountComponent } from './components/delete-account/delete-account.component';

@Component({
  selector: 'rx-profile',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    DividerModule,
    InputGroupModule,
    InputGroupAddonModule,
    FileUploadModule,
    InputWrapperComponent,
    AvatarComponent,
    ImportExportComponent,
    TranslatePipe,
    DatePipe,
    WorldPhoneMasksDirective,
    SelectSingleComponent,
    SelectModule,
  ],
  providers: [DialogService],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly #store = inject(Store);
  readonly #countryService = inject(CountryService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #fileUploadService = inject(FileUploadService);
  readonly #fb = inject(FormBuilder);
  readonly #dialogService = inject(DialogService);
  readonly #translateService = inject(TranslateService);

  #ref!: DynamicDialogRef | null;

  readonly user = this.#store.selectSignal(ProfileState.user);

  readonly countryFetchMethod = (options: IFetchOptions) => this.#countryService.fetchCountries(options);
  readonly countryMapToSelect = (item: ICountry) => ({
    label: `COUNTRIES.${item.name}`,
    value: { name: item.name, id: item.name },
    id: item.name,
  });
  readonly countryValueMapper = (country: ICountry) => ({ name: country?.name });

  readonly FieldEditing = FieldEditing;
  readonly fieldEdititng = signal<FieldEditing | false>(false);

  readonly importExportSections: IImportExportSection[] = [
    {
      entityId: 'catalog',
      labelKey: 'IMPORT_EXPORT.CATALOG',
      formats: ['csv'],
      importEndpoint: 'property-object/import',
      exportEndpoint: 'property-object/export',
      exportTypeSuffix: 'csv',
    },
  ];

  readonly userForm = this.#fb.group({
    email: [this.user()?.email, [Validators.required, Validators.email]],
    companyName: [this.user()?.companyName],
    companyLogo: [this.user()?.companyLogo],
    firstName: [this.user()?.firstName],
    lastName: [this.user()?.lastName],
    phone: [this.user()?.phone],
    country: [this.user()?.country],
    currency: [this.user()?.currency],
  });

  readonly currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);
  onUpload(event: FileUploadHandlerEvent): void {
    if (event && Array.isArray(event.files)) {
      const files: File[] = event.files;

      this.#fileUploadService
        .upload(files)
        .pipe(
          filter((e): e is HttpResponse<string[]> => e.type === HttpEventType.Response),
          map(e => e.body ?? []),
          takeUntilDestroyed(this.#destroyRef),
        )
        .subscribe({
          next: (newUrls: string[]) => {
            this.userForm.controls['companyLogo'].setValue(newUrls[0]);
            this.userForm.controls['companyLogo'].markAsDirty();
          },
          error: () => {},
        });
    }
  }

  editProfile(field: FieldEditing): void {
    const isfieldEditing = this.fieldEdititng() == field;

    if (isfieldEditing) {
      const user = this.user() as IUser;
      this.userForm.get(field)?.reset(user?.[field]);
      this.fieldEdititng.set(false);
    } else this.fieldEdititng.set(field);
  }

  updateProfile(): void {
    const dirtyPatch: Partial<IUser> = {};

    for (const [key, control] of Object.entries(this.userForm.controls))
      if (control.dirty) (dirtyPatch as any)[key] = control.value;

    if (Object.keys(dirtyPatch).length === 0) return;

    this.#store
      .dispatch(new EditProfile(dirtyPatch))
      .pipe(
        catchError(() => {
          this.userForm.reset(this.user() || {});
          return of();
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(() => {
        this.userForm.markAsPristine();
      });
  }

  logOut(): void {
    this.#store.dispatch(new Logout());
  }

  terminate(): void {
    this.#store.dispatch(new Terminate());
  }

  openChangePasswordDialog(): void {
    this.#ref = this.#dialogService.open(ChangePasswordComponent, {
      header: this.#translateService.instant('PROFILE.CHANGE_PASSWORD'),
      width: '470px',
      modal: true,
      closable: true,
      dismissableMask: true,
      draggable: false,
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '640px': '90vw',
      },
    });
  }

  openDeleteAccountDialog(): void {
    this.#ref = this.#dialogService.open(DeleteAccountComponent, {
      header: this.#translateService.instant('PROFILE.DELETE_ACCOUNT'),
      width: '520px',
      modal: true,
      closable: true,
      dismissableMask: true,
      draggable: false,
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '640px': '90vw',
      },
    });
  }
}

enum FieldEditing {
  CompanyName = 'companyName',
  CompanyLogo = 'companyLogo',
  Email = 'email',
  FirstName = 'firstName',
  LastName = 'lastName',
  Phone = 'phone',
  Country = 'country',
  Currency = 'currency',
}
