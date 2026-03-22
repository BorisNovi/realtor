import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { STORAGE_NAMESPACE } from '@shared/constants';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #storageSignal = signal<Record<string, unknown>>(this.#loadInitialData());

  // Публичный сигнал для доступа к данным
  readonly data = computed(() => this.#storageSignal());

  // Эффект для синхронизации с localStorage
  constructor() {
    effect(() => {
      if (!this.#isBrowser) return;
      try {
        const currentData = this.#storageSignal();
        for (const [key, value] of Object.entries(currentData)) {
          // Сохраняем простые типы без лишних кавычек, сложные — через JSON
          const storedValue = this.#isSimpleType(value) ? String(value) : JSON.stringify(value);
          localStorage.setItem(key, storedValue);
        }
        this.#cleanUpUnusedKeys(currentData);
      } catch (error) {
        console.error(`Error while writing to localStorage: ${error}`);
      }
    });
  }

  // Получение значения по ключу
  getItem<T>(key: string): T | null {
    const data = this.#storageSignal();
    const namespacedKey = this.#getNamespacedKey(key);
    return data[namespacedKey] !== undefined ? (data[namespacedKey] as T) : null;
  }

  // Установка значения по ключу
  setItem<T>(key: string, value: T): void {
    const namespacedKey = this.#getNamespacedKey(key);
    this.#storageSignal.update(currentData => ({
      ...currentData,
      [namespacedKey]: value,
    }));
  }

  // Удаление значения по ключу
  removeItem(key: string): void {
    const namespacedKey = this.#getNamespacedKey(key);
    this.#storageSignal.update(currentData => {
      const newData = { ...currentData };
      delete newData[namespacedKey];
      if (this.#isBrowser) localStorage.removeItem(namespacedKey);
      return newData;
    });
  }

  // Очистка всех данных
  clear(): void {
    this.#storageSignal.update(currentData => {
      if (this.#isBrowser) {
        for (const key of Object.keys(currentData)) {
          localStorage.removeItem(key);
        }
      }
      return {};
    });
  }

  // Загрузка начальных данных из localStorage
  #loadInitialData(): Record<string, unknown> {
    if (!this.#isBrowser) return {};
    const data: Record<string, unknown> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_NAMESPACE)) {
          const rawValue = localStorage.getItem(key);
          if (rawValue) {
            // Пробуем распарсить как JSON, если не получается — оставляем как строку
            try {
              data[key] = JSON.parse(rawValue);
            } catch {
              data[key] = rawValue; // Оставляем как есть для простых значений
            }
          }
        }
      }
      return data;
    } catch (error) {
      console.error(`Error while reading from localStorage: ${error}`);
      return {};
    }
  }

  // Удаление ключей, которых нет в текущем состоянии
  #cleanUpUnusedKeys(currentData: Record<string, unknown>): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_NAMESPACE) && !(key in currentData)) {
        localStorage.removeItem(key);
      }
    }
  }

  // Формирование ключа с неймспейсом
  #getNamespacedKey(key: string): string {
    return `${STORAGE_NAMESPACE}${key}`;
  }

  // Проверка, является ли значение простым типом (строка, число, булево, null)
  #isSimpleType(value: unknown): boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null;
  }
}
