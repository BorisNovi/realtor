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

export function getPropertyStatusColor(status: string, type: 'color' | 'background' = 'background'): string {
  const prefix = type === 'color' ? 'color' : 'background';

  switch (status) {
    case PropertyStatus.available:
      return `var(--p-tag-success-${prefix})`;
    case PropertyStatus.reserved:
      return `var(--p-tag-warn-${prefix})`;
    case PropertyStatus.rented:
      return `var(--p-tag-danger-${prefix})`;
    default:
      return `var(--p-tag-info-${prefix})`;
  }
}
