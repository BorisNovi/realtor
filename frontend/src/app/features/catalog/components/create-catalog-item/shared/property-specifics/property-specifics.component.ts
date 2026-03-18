import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FieldsetCheckboxGroupComponent, InputWrapperComponent } from '@shared/components';
import { SPECIFICS_FIELDSET_BY_TYPE, SPECIFICS_FIELDS_BY_TYPE, SpecificsFieldKey } from '@shared/constants/fieldset.configs';
import { FurnishedStatus, HeatingType, KitchenType, PropertyType, RenovationStatus } from '@shared/enums';
import { mapEnumToOptions } from '@shared/utils';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'rx-property-specifics',
  templateUrl: './property-specifics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    InputWrapperComponent,
    InputNumberModule,
    SelectModule,
    FieldsetCheckboxGroupComponent,
  ],
})
export class PropertySpecificsComponent {
  readonly form = input.required<FormGroup>();
  readonly type = input.required<PropertyType | null>();

  readonly #translateService = inject(TranslateService);

  readonly fields = computed<Set<SpecificsFieldKey>>(() => {
    const type = this.type();
    return type ? new Set(SPECIFICS_FIELDS_BY_TYPE[type]) : new Set();
  });

  readonly fieldsetConfig = computed(() => {
    const type = this.type();
    return type ? SPECIFICS_FIELDSET_BY_TYPE[type] : [];
  });

  readonly heatingTypes = mapEnumToOptions(HeatingType, v =>
    this.#translateService.instant(`FORM.PROPERTIES.HEATING_TYPE.${v}`),
  );
  readonly furnishedStatuses = mapEnumToOptions(FurnishedStatus, v =>
    this.#translateService.instant(`FORM.PROPERTIES.FURNISHED_STATUS.${v}`),
  );
  readonly renovationStatuses = mapEnumToOptions(RenovationStatus, v =>
    this.#translateService.instant(`FORM.PROPERTIES.RENOVATION_STATUS.${v}`),
  );
  readonly kitchenTypes = mapEnumToOptions(KitchenType, v =>
    this.#translateService.instant(`FORM.PROPERTIES.KITCHEN_TYPE.${v}`),
  );
}
