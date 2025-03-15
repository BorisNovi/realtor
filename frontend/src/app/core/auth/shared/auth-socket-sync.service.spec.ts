import { TestBed } from '@angular/core/testing';

import { AuthSocketSyncService } from './auth-socket-sync.service';
import { provideStore } from '@ngxs/store';

describe('AuthSocketSyncService', () => {
  let service: AuthSocketSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore()],
    });
    service = TestBed.inject(AuthSocketSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
