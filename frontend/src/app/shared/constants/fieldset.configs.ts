import { PropertyType } from '@shared/enums';
import { IFieldsetConfig, IPropertyObjectSpecifics } from '@shared/interfaces';

// Гранулярные ключи секции specifics для конфига и шаблона.
// floor дробится на currentFloor / totalFloors, чтобы управлять ими независимо.
// Структура данных (IPropertyObjectSpecifics) остаётся прежней — floor.current / floor.full.
export type SpecificsFieldKey = Exclude<keyof IPropertyObjectSpecifics, 'floor'> | 'currentFloor' | 'totalFloors';

// Единственная точка правды: управляет построением FormGroup, шаблоном и очисткой данных при сабмите.
export const SPECIFICS_FIELDS_BY_TYPE: Record<PropertyType, SpecificsFieldKey[]> = {
  [PropertyType.flat]: ['rooms', 'currentFloor', 'totalFloors', 'kitchen', 'heating', 'furnished', 'renovation', 'options'],
  [PropertyType.house]: ['rooms', 'totalFloors', 'heating', 'furnished', 'renovation', 'options'],
  [PropertyType.room]: ['currentFloor', 'totalFloors', 'heating', 'furnished', 'renovation', 'options'],
  [PropertyType.office]: ['currentFloor', 'totalFloors', 'heating', 'furnished', 'renovation', 'options'],
  [PropertyType.land]: ['options'],
};

// Квартира
const flatFieldsetConfig: IFieldsetConfig[] = [
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
      { formControlName: 'beautifulView', label: 'FORM.LABELS.BEAUTIFUL_VIEW' },
      { formControlName: 'newBuilding', label: 'FORM.LABELS.NEW_BUILDING' },
      { formControlName: 'elevator', label: 'FORM.LABELS.ELEVATOR' },
      { formControlName: 'balcony', label: 'FORM.LABELS.BALCONY' },
      { formControlName: 'garage', label: 'FORM.LABELS.GARAGE' },
    ],
  },
];

// Дом: без общих удобств
const houseFieldsetConfig: IFieldsetConfig[] = [
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
      { formControlName: 'elevator', label: 'FORM.LABELS.ELEVATOR' },
      { formControlName: 'bath', label: 'FORM.LABELS.BATH' },
      { formControlName: 'shower', label: 'FORM.LABELS.SHOWER' },
      { formControlName: 'airConditioning', label: 'FORM.LABELS.AIR_CONDITIONING' },
      { formControlName: 'fireplace', label: 'FORM.LABELS.FIREPLACE' },
      { formControlName: 'beautifulView', label: 'FORM.LABELS.BEAUTIFUL_VIEW' },
      { formControlName: 'newBuilding', label: 'FORM.LABELS.NEW_BUILDING' },
      { formControlName: 'balcony', label: 'FORM.LABELS.BALCONY' },
      { formControlName: 'garden', label: 'FORM.LABELS.GARDEN' },
      { formControlName: 'garage', label: 'FORM.LABELS.GARAGE' },
    ],
  },
];

// Комната: общие удобства, ограниченные личные опции
const roomFieldsetConfig: IFieldsetConfig[] = [
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
      { formControlName: 'internet', label: 'FORM.LABELS.INTERNET' },
    ],
  },
  {
    formGroupName: 'other',
    label: 'FORM.LABELS.OTHER',
    fields: [
      { formControlName: 'bath', label: 'FORM.LABELS.BATH' },
      { formControlName: 'shower', label: 'FORM.LABELS.SHOWER' },
      { formControlName: 'airConditioning', label: 'FORM.LABELS.AIR_CONDITIONING' },
      { formControlName: 'beautifulView', label: 'FORM.LABELS.BEAUTIFUL_VIEW' },
      { formControlName: 'balcony', label: 'FORM.LABELS.BALCONY' },
    ],
  },
];

// Офис: технические коммуникации, без личных удобств
const officeFieldsetConfig: IFieldsetConfig[] = [
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
      { formControlName: 'elevator', label: 'FORM.LABELS.ELEVATOR' },
      { formControlName: 'airConditioning', label: 'FORM.LABELS.AIR_CONDITIONING' },
      { formControlName: 'beautifulView', label: 'FORM.LABELS.BEAUTIFUL_VIEW' },
      { formControlName: 'newBuilding', label: 'FORM.LABELS.NEW_BUILDING' },
      { formControlName: 'garage', label: 'FORM.LABELS.GARAGE' },
    ],
  },
];

// Участок: только коммуникации и базовые внешние признаки
const landFieldsetConfig: IFieldsetConfig[] = [
  {
    formGroupName: 'utilities',
    label: 'FORM.LABELS.UTILITIES',
    fields: [
      { formControlName: 'electricity', label: 'FORM.LABELS.ELECTRICITY' },
      { formControlName: 'waterSupply', label: 'FORM.LABELS.WATER_SUPPLY' },
      { formControlName: 'naturalGas', label: 'FORM.LABELS.NATURAL_GAS' },
      { formControlName: 'sewerage', label: 'FORM.LABELS.SEWERAGE' },
    ],
  },
  {
    formGroupName: 'other',
    label: 'FORM.LABELS.OTHER',
    fields: [
      { formControlName: 'parking', label: 'FORM.LABELS.PARKING' },
      { formControlName: 'beautifulView', label: 'FORM.LABELS.BEAUTIFUL_VIEW' },
      { formControlName: 'garden', label: 'FORM.LABELS.GARDEN' },
      { formControlName: 'garage', label: 'FORM.LABELS.GARAGE' },
    ],
  },
];

// Fieldset опций (чекбоксы) по типу объекта
export const SPECIFICS_FIELDSET_BY_TYPE: Record<PropertyType, IFieldsetConfig[]> = {
  [PropertyType.flat]: flatFieldsetConfig,
  [PropertyType.house]: houseFieldsetConfig,
  [PropertyType.room]: roomFieldsetConfig,
  [PropertyType.office]: officeFieldsetConfig,
  [PropertyType.land]: landFieldsetConfig,
};
