import { computed, inject, Injectable, signal } from '@angular/core';
import { VIEW_MODE_KEY } from '@shared/constants';
import { StorageService } from './storage.service';

export type ViewMode = 'table' | 'cards';

@Injectable({
  providedIn: 'root',
})
export class ViewModeService {
  readonly #storageService = inject(StorageService);
  readonly #viewMode = signal<ViewMode>(this.#storageService.getItem<ViewMode>(VIEW_MODE_KEY) ?? 'table');

  readonly viewMode = computed(() => this.#viewMode());

  toggle(): void {
    const next: ViewMode = this.#viewMode() === 'table' ? 'cards' : 'table';
    this.#viewMode.set(next);
    this.#storageService.setItem(VIEW_MODE_KEY, next);
    console.log('viewMode:', next);
  }
}
