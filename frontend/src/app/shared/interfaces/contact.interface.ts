import { IEntity } from './entity.interface';

export interface IContact extends IEntity {
  phone: string;
  additional_phone?: string;
  comment?: string;
}
