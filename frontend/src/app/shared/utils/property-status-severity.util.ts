import { PropertyStatus } from '@shared/enums';

export function getPropertyStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
  switch (status) {
    case PropertyStatus.available:
      return 'success';
    case PropertyStatus.rented:
      return 'warn';
    case PropertyStatus.reserved:
      return 'danger';
    default:
      return 'info';
  }
}
