import { computed, inject, Injectable, signal } from '@angular/core';
import { VIEW_MODE_KEY } from '@shared/constants';
import { StorageService } from './storage.service';

export enum ViewMode {
  Table = 'table',
  Cards = 'cards',
}

@Injectable({
  providedIn: 'root',
})
export class ViewModeService {
  readonly #storageService = inject(StorageService);
  readonly #viewMode = signal<ViewMode>(
    this.#storageService.getItem<ViewMode>(VIEW_MODE_KEY) ?? (window.innerWidth <= 768 ? ViewMode.Cards : ViewMode.Table),
  );

  readonly viewMode = computed(() => this.#viewMode());

  toggle(): void {
    const next: ViewMode = this.#viewMode() === ViewMode.Table ? ViewMode.Cards : ViewMode.Table;
    this.#viewMode.set(next);
    this.#storageService.setItem(VIEW_MODE_KEY, next);
    console.log('viewMode:', next);
  }
}
