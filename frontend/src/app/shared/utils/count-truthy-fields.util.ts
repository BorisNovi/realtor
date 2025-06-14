/**
 * Подсчитывает количество полей с truthy-значениями, игнорируя заданные пути.
 * Учитываются: строки, числа, булевы, массивы, Date.
 *
 * @param obj Объект для обхода.
 * @param ignoredPaths Пути, которые нужно игнорировать (например: ['dateAdded.to']).
 * @returns Количество truthy-полей, не входящих в игнор.
 */
export function countTruthyFields(obj: unknown, ignoredPaths: string[] = []): number {
  const flatIgnored = new Set(ignoredPaths);

  function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  function walk(value: unknown, path = ''): number {
    if (flatIgnored.has(path)) return 0;

    if (isValidDate(value)) return 1;

    if (Array.isArray(value)) {
      return value.length > 0 ? 1 : 0;
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce((acc, [key, val]) => {
        const newPath = path ? `${path}.${key}` : key;
        return acc + walk(val, newPath);
      }, 0);
    }

    return value ? 1 : 0;
  }

  return walk(obj);
}
