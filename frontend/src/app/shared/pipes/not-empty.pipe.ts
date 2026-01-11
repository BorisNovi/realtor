import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'notEmpty' })
export class NotEmptyPipe implements PipeTransform {
  transform<T = any>(items: readonly T[] | null | undefined): readonly T[] | null {
    return Array.isArray(items) && items.length ? items : null;
  }
}
