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
  switch (status) {
    case PropertyStatus.available:
      return type === 'color' ? 'var(--p-green-300)' : 'color-mix(in srgb, var(--p-green-500), transparent 84%)';

    case PropertyStatus.reserved:
      return type === 'color' ? 'var(--p-orange-300)' : 'color-mix(in srgb, var(--p-orange-500), transparent 84%)';

    case PropertyStatus.rented:
      return type === 'color' ? 'var(--p-red-300)' : 'color-mix(in srgb, var(--p-red-500), transparent 84%)';

    default:
      return type === 'color' ? 'var(--p-sky-300)' : 'color-mix(in srgb, var(--p-sky-500), transparent 84%)';
  }
}

// TODO: убрать, когда будут иконки
export function getMapPropertyStatusColor(status: string): string {
  switch (status) {
    case PropertyStatus.available:
      return 'rgba(34,197,94,0.9)';
    case PropertyStatus.reserved:
      return 'rgba(251,191,36,0.9)';
    case PropertyStatus.rented:
      return 'rgba(239,68,68,0.9)';
    default:
      return 'rgba(56,189,248,0.9)';
  }
}
