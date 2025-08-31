export function mapEnumToOptions<T extends string>(
  enumObj: Record<string, T>,
  labelFormatter: (value: T) => string = value => value.charAt(0).toUpperCase() + value.slice(1),
): { label: string; value: T }[] {
  return Object.values(enumObj).map(value => ({
    label: labelFormatter(value),
    value,
  }));
}
