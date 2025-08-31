import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'camelToUpperSnake' })
export class CamelToUpperSnakePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
  }
}
