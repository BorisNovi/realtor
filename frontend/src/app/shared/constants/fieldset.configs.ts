import { IFieldsetConfig } from '@shared/interfaces';

// TODO: в дальнейшем позволить клиенту самому создавать конфиг черз форму
export const createItemsFieldsetConfig: IFieldsetConfig[] = [
  {
    formGroupName: 'sharedFacilities',
    label: 'FORM.LABELS.SHARED_FACILITIES',
    fields: [
      { formControlName: 'kitchen', label: 'FORM.LABELS.SHARED_KITCHEN' },
      { formControlName: 'bathroom', label: 'FORM.LABELS.BATHROOM' },
    ],
  },
  {
    formGroupName: 'utilities',
    label: 'FORM.LABELS.UTILITIES',
    fields: [
      { formControlName: 'electricity', label: 'FORM.LABELS.ELECTRICITY' },
      { formControlName: 'waterSupply', label: 'FORM.LABELS.WATER_SUPPLY' },
      { formControlName: 'naturalGas', label: 'FORM.LABELS.NATURAL_GAS' },
      { formControlName: 'sewerage', label: 'FORM.LABELS.SEWERAGE' },
      { formControlName: 'internet', label: 'FORM.LABELS.INTERNET' },
    ],
  },
  {
    formGroupName: 'other',
    label: 'FORM.LABELS.OTHER',
    fields: [
      { formControlName: 'parking', label: 'FORM.LABELS.PARKING' },
      { formControlName: 'bath', label: 'FORM.LABELS.BATH' },
      { formControlName: 'shower', label: 'FORM.LABELS.SHOWER' },
      { formControlName: 'airConditioning', label: 'FORM.LABELS.AIR_CONDITIONING' },
      { formControlName: 'fireplace', label: 'FORM.LABELS.FIREPLACE' },
      { formControlName: 'beautifulView', label: 'FORM.LABELS.BEAUTIFUL_VIEW' },
      { formControlName: 'newBuilding', label: 'FORM.LABELS.NEW_BUILDING' },
      { formControlName: 'elevator', label: 'FORM.LABELS.ELEVATOR' },
      { formControlName: 'balcony', label: 'FORM.LABELS.BALCONY' },
      { formControlName: 'garden', label: 'FORM.LABELS.GARDEN' },
      { formControlName: 'garage', label: 'FORM.LABELS.GARAGE' },
    ],
  },
];
