import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MenuitemComponent } from './menuitem.component';
import { PrivateLayoutService } from '../../shared';
import { MenuItem } from 'primeng/api';

describe('MenuitemComponent', () => {
  let component: MenuitemComponent;
  let fixture: ComponentFixture<MenuitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuitemComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: PrivateLayoutService,
          useValue: {
            menuSource$: { subscribe: () => ({ unsubscribe: () => {} }) },
            resetSource$: { subscribe: () => ({ unsubscribe: () => {} }) },
            onMenuStateChange: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuitemComponent);
    component = fixture.componentInstance;

    component.item = { label: 'Test Item' } as MenuItem;
    component.index = 0;
    component.root = false;
    component.parentKey = 'parent';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
