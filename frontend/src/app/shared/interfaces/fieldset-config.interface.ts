export interface IFieldsetConfig {
  formGroupName: string;
  label: string;
  fields: { formControlName: string; label: string }[];
}
