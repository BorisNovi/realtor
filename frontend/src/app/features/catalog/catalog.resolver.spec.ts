import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { catalogResolver } from './catalog.resolver';

describe('catalogResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => catalogResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
