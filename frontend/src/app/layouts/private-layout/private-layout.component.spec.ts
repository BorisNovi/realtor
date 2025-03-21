import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateLayoutComponent } from './private-layout.component';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('PrivateLayoutComponent', () => {
  let component: PrivateLayoutComponent;
  let fixture: ComponentFixture<PrivateLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateLayoutComponent],
      providers: [provideTranslateService(), provideRouter([]), provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivateLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
