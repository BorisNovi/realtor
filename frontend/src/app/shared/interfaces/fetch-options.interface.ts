import { IPagination } from './pagination.interface';
import { ISort } from './sort.interface';

export interface IFetchOptions<F = any> {
  filters?: F;
  pagination?: IPagination;
  sort?: ISort | null;
  search?: string | null;
}
