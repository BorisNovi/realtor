import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InputWrapperComponent, SelectSingleComponent } from '@shared/components';
import { IContact, IFetchOptions } from '@shared/interfaces';
import { WorldPhoneMaskPipe } from '@shared/pipes';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { take } from 'rxjs';
import { ContactsService } from 'src/app/core';
import { CreateContactComponent } from 'src/app/features/contacts';

@Component({
  selector: 'rx-property-contact-fields',
  templateUrl: './property-contact-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    InputWrapperComponent,
    SelectSingleComponent,
    DividerModule,
    ButtonModule,
    DynamicDialogModule,
  ],
  providers: [WorldPhoneMaskPipe],
})
export class PropertyContactFieldsComponent {
  readonly form = input.required<FormGroup>();

  readonly #translateService = inject(TranslateService);
  readonly #dialogService = inject(DialogService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #worldPhoneMaskPipe = inject(WorldPhoneMaskPipe);
  readonly contactsService = inject(ContactsService);

  readonly contactFetchMethod = (options: IFetchOptions) => this.contactsService.fetchContacts(options);
  readonly contactMapToSelect = (item: IContact) => ({
    label: `${item?.name} ${this.#worldPhoneMaskPipe.transform(item?.phone)}`,
    value: item,
    id: item.id,
  });
  readonly contactValueMapper = (contact: IContact) => ({ id: contact.id });

  openContactDialog(): void {
    const dialogRef = this.#dialogService.open(CreateContactComponent, {
      header: this.#translateService.instant('CONTACTS.DIALOG.ADD'),
      appendTo: document.querySelector('.p-dynamic-dialog')!,
      width: '480px',
      modal: true,
      closable: true,
      dismissableMask: true,
      draggable: false,
      focusOnShow: false,
      breakpoints: { '640px': '90vw' },
    });

    dialogRef?.onClose
      .pipe(take(1), takeUntilDestroyed(this.#destroyRef))
      .subscribe(result => this.form().get('contact')?.setValue(result));
  }
}
