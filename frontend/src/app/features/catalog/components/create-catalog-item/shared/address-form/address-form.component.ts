import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { InputWrapperComponent, SelectSingleComponent } from '@shared/components';
import { IAddress, ICountry, IFetchOptions } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';
import { AuthState, CountryService } from 'src/app/core';

@Component({
  selector: 'rx-address-form',
  imports: [InputWrapperComponent, InputTextModule, TranslatePipe, ReactiveFormsModule, SelectSingleComponent],
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit {
  readonly value = input<IAddress>();
  readonly form = input.required<FormGroup>();

  readonly #store = inject(Store);
  readonly #translateService = inject(TranslateService);
  readonly #countryService = inject(CountryService);

  readonly #user = this.#store.selectSignal(AuthState.user);

  readonly countryFetchMethod = (options: IFetchOptions) => this.#countryService.fetchCountries(options);
  readonly countryMapToSelect = (item: ICountry) => ({
    label: this.#translateService.instant(`COUNTRIES.${item?.name}`),
    value: item,
    id: item.id,
  });
  readonly countryValueMapper = (country: ICountry) => ({ country: country?.name });

  ngOnInit(): void {
    const f = this.form();
    const v = this.value();
    f.addControl('country', new FormControl(v?.country || this.#user()?.country?.name || '', Validators.required));
    f.addControl('state', new FormControl(v?.state || ''));
    f.addControl('city', new FormControl(v?.city || '', Validators.required));
    f.addControl('road', new FormControl(v?.road || '', Validators.required));
    f.addControl('house', new FormControl(v?.house || '', Validators.required));
    f.addControl('apartment', new FormControl(v?.apartment || ''));
    f.addControl('position', new FormControl(v?.position || [0, 0]));
  }
}
