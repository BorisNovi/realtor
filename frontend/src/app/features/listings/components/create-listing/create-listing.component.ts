import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { InputWrapperComponent } from '@shared/components';
import { IListing } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButton } from 'primeng/togglebutton';
import { tap } from 'rxjs';
import { CreateListing, UpdateListing } from 'src/app/core/listings/state';

@Component({
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, InputWrapperComponent, TranslatePipe, ToggleButton],
  templateUrl: './create-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateListingComponent implements OnInit {
  readonly #ref = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);

  form!: FormGroup;

  ngOnInit(): void {
    this.#initForm();
  }

  #initForm(): void {
    const data: IListing = this.config.data;

    this.form = this.#fb.group({
      // TODO: добавить читаемый текст ошибок
      name: [data?.name || null, [Validators.required, Validators.maxLength(50)]],
      linkAvailable: [data?.publicLink.available || true],
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;
    const hasId = Boolean(this.config.data?.id);

    const payload = hasId
      ? { ...this.config.data, ...formData, publicLink: { linkAvailable: formData.linkAvailable } }
      : { ...formData, publicLink: { linkAvailable: formData.linkAvailable } };
    const action = hasId ? new UpdateListing(payload) : new CreateListing(payload);

    this.#store
      .dispatch(action)
      .pipe(
        tap(() => this.#ref.close(payload)),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  onCancel(): void {
    this.#ref.close();
  }
}
