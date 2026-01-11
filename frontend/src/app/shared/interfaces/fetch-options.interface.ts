import { IPagination } from './pagination.interface';
import { ISort } from './sort.interface';

export interface IFetchOptions<F = any, Q extends Record<string, any> = Record<string, any>> {
  filters?: F;
  pagination?: IPagination;
  sort?: ISort | null;
  search?: string | null;
  query?: Q;
}
