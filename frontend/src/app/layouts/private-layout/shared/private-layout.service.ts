import { Injectable, effect, signal, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ILayoutConfig } from './layout-config.interface';
import { StorageService } from 'src/app/core';

interface ILayoutState {
  staticMenuDesktopInactive?: boolean;
  overlayMenuActive?: boolean;
  configSidebarVisible?: boolean;
  staticMenuMobileActive?: boolean;
  menuHoverActive?: boolean;
}

interface IMenuChangeEvent {
  key: string;
  routeEvent?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PrivateLayoutService {
  private readonly storageService = inject(StorageService);

  _config: ILayoutConfig = {
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: this.getStoredTheme() === 'dark',
    menuMode: 'static',
  };

  _state: ILayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  };

  layoutConfig = signal<ILayoutConfig>(this._config);

  layoutState = signal<ILayoutState>(this._state);

  private configUpdate = new Subject<ILayoutConfig>();

  private overlayOpen = new Subject<null>();

  private menuSource = new Subject<IMenuChangeEvent>();

  private resetSource = new Subject();

  menuSource$ = this.menuSource.asObservable();

  resetSource$ = this.resetSource.asObservable();

  configUpdate$ = this.configUpdate.asObservable();

  overlayOpen$ = this.overlayOpen.asObservable();

  theme = computed(() => (this.layoutConfig().darkTheme ? 'light' : 'dark'));

  isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

  isDarkTheme = computed(() => this.layoutConfig().darkTheme);

  getPrimary = computed(() => this.layoutConfig().primary);

  getSurface = computed(() => this.layoutConfig().surface);

  isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

  transitionComplete = signal<boolean>(false);

  private initialized = false;

  constructor() {
    effect(() => {
      const config = this.layoutConfig();
      if (config) {
        this.handleDarkModeTransition(config);
        this.onConfigUpdate();
      }
    });

    effect(() => {
      const config = this.layoutConfig();

      if (!this.initialized || !config) {
        this.initialized = true;
        return;
      }

      this.handleDarkModeTransition(config);
    });

    this.initSystemThemeListener();
  }

  toggleTheme() {
    this.layoutConfig.update(config => ({
      ...config,
      darkTheme: !config.darkTheme,
    }));
  }

  private handleDarkModeTransition(config: ILayoutConfig): void {
    if ((document as Document).startViewTransition) {
      this.startViewTransition(config);
    } else {
      this.toggleDarkMode(config);
      this.onTransitionEnd();
    }
  }

  private startViewTransition(config: ILayoutConfig): void {
    const transition = (document as Document).startViewTransition(() => {
      this.toggleDarkMode(config);
    });

    transition.ready
      .then(() => {
        this.onTransitionEnd();
      })
      .catch(() => {});
  }

  private toggleDarkMode(config: ILayoutConfig): void {
    document.documentElement.classList.toggle('app-dark', config.darkTheme);
    this.storageService.setItem<string>('theme', config.darkTheme ? 'dark' : 'light');
  }

  private onTransitionEnd(): void {
    this.transitionComplete.set(true);
    setTimeout(() => {
      this.transitionComplete.set(false);
    });
  }

  private initSystemThemeListener(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      this.layoutConfig.update(config => ({
        ...config,
        darkTheme: event.matches,
      }));
    });
  }

  private getStoredTheme(): 'dark' | 'light' {
    const stored = this.storageService.getItem<string>('theme');
    return stored === 'dark' || stored === 'light' ? stored : 'light';
  }

  onMenuToggle() {
    if (this.isOverlay()) {
      this.layoutState.update(prev => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));

      if (this.layoutState().overlayMenuActive) {
        this.overlayOpen.next(null);
      }
    }

    if (this.isDesktop()) {
      this.layoutState.update(prev => ({
        ...prev,
        staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive,
      }));
    } else {
      this.layoutState.update(prev => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));

      if (this.layoutState().staticMenuMobileActive) {
        this.overlayOpen.next(null);
      }
    }
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return !this.isDesktop();
  }

  onConfigUpdate() {
    this._config = { ...this.layoutConfig() };
    this.configUpdate.next(this.layoutConfig());
  }

  onMenuStateChange(event: IMenuChangeEvent) {
    this.menuSource.next(event);
  }

  reset() {
    this.resetSource.next(true);
  }
}
