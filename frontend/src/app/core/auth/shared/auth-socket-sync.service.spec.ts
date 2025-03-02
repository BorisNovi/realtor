import { TestBed } from '@angular/core/testing';

import { AuthSocketSyncService } from './auth-socket-sync.service';

describe('AuthSocketSyncService', () => {
  let service: AuthSocketSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSocketSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
