import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InputWrapperComponent } from '@shared/components';
import { PropertyStatus, PropertyType, ZoningType } from '@shared/enums';
import { getPropertyStatusBackground, getPropertyStatusSeverity, mapEnumToOptions } from '@shared/utils';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'rx-property-basic-fields',
  templateUrl: './property-basic-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    InputWrapperComponent,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    ButtonModule,
    AutoFocusModule,
  ],
})
export class PropertyBasicFieldsComponent {
  readonly form = input.required<FormGroup>();

  readonly #translateService = inject(TranslateService);

  readonly getSeverity = getPropertyStatusSeverity;
  readonly getStatusBackground = getPropertyStatusBackground;

  readonly statuses = mapEnumToOptions(PropertyStatus, value =>
    this.#translateService.instant(`FORM.PROPERTIES.PROPERTY_STATUS.${value}`),
  );
  readonly zoningTypes = mapEnumToOptions(ZoningType, value =>
    this.#translateService.instant(`FORM.PROPERTIES.ZONING_TYPE.${value}`),
  );
  readonly propertyTypes = mapEnumToOptions(PropertyType, value =>
    this.#translateService.instant(`FORM.PROPERTIES.PROPERTY_TYPE.${value}`),
  );
}
