import { PropertyStatus } from '@shared/enums';

export function getPropertyStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
  switch (status) {
    case PropertyStatus.available:
      return 'success';
    case PropertyStatus.reserved:
      return 'warn';
    case PropertyStatus.rented:
      return 'danger';
    default:
      return 'info';
  }
}

export function getPropertyStatusBackground(status: string): string {
  if (!status) return 'var(--p-tag-info-background)';

  switch (status) {
    case PropertyStatus.available:
      return 'var(--p-tag-success-background)';
    case PropertyStatus.reserved:
      return 'var(--p-tag-warn-background)';
    case PropertyStatus.rented:
      return 'var(--p-tag-danger-background)';
    default:
      return 'var(--p-tag-info-background)';
  }
}
