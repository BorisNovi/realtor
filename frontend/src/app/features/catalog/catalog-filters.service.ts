import { Injectable, signal } from '@angular/core';

@Injectable()
export class CatalogFiltersService {
  #filtersOpen = signal<boolean>(false);
  #filtersCounst = signal<number>(0);

  filtersCount = this.#filtersCounst.asReadonly();
  isOpen = this.#filtersOpen.asReadonly();

  setFiltersCount(count: number): void {
    this.#filtersCounst.set(count);
  }

  openFilters(): void {
    this.#filtersOpen.set(true);
  }

  closeFilters(): void {
    this.#filtersOpen.set(false);
  }
}
