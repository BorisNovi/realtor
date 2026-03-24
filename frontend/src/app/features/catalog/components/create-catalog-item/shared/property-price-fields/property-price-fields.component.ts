import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InputWrapperComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { mapEnumToOptions } from '@shared/utils';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'rx-property-price-fields',
  templateUrl: './property-price-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    InputWrapperComponent,
    DividerModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    ButtonModule,
  ],
})
export class PropertyPriceFieldsComponent {
  readonly form = input.required<FormGroup>();

  readonly currencies = mapEnumToOptions(Currency, value => `${CURRENCY_SYMBOLS[value]} (${value})`);
}
