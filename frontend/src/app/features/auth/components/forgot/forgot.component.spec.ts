import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotComponent } from './forgot.component';
import { provideStore } from '@ngxs/store';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { AuthState } from 'src/app/core';
import { provideHttpClient } from '@angular/common/http';

describe('ForgotComponent', () => {
  let component: ForgotComponent;
  let fixture: ComponentFixture<ForgotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotComponent],
      providers: [provideStore([AuthState]), provideTranslateService(), provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
