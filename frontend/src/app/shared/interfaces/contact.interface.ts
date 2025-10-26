export interface IContact {
  id: number;
  dateAdded: string | Date;
  name: string;
  phone: string;
  additional_phone?: string;
}
