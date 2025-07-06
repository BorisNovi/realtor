import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CatalogFiltersService {
  private filtersCountSubject = new BehaviorSubject<number>(0);
  private filtersOpenSubject = new BehaviorSubject<boolean>(false);

  filtersCount$ = this.filtersCountSubject.asObservable();
  filtersOpen$ = this.filtersOpenSubject.asObservable();

  setFiltersCount(count: number) {
    this.filtersCountSubject.next(count);
  }

  openFilters() {
    this.filtersOpenSubject.next(true);
  }

  closeFilters() {
    this.filtersOpenSubject.next(false);
  }

  toggleFilters() {
    this.filtersOpenSubject.next(!this.filtersOpenSubject.getValue());
  }

  get currentCount() {
    return this.filtersCountSubject.getValue();
  }

  get isOpen() {
    return this.filtersOpenSubject.getValue();
  }

  set isOpen(value: boolean) {
    this.filtersOpenSubject.next(value);
  }
}
