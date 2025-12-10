import { IEntity } from './entity.interface';

export interface IContact extends IEntity {
  phone: string;
  additionalPhone?: string;
  comment?: string;
}
