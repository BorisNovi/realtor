import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { PrivateLayoutService } from './shared';
import { FooterComponent, SidebarComponent, TopbarComponent } from './components';

@Component({
  selector: 'rx-private-layout',
  imports: [RouterOutlet, CommonModule, TopbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './private-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateLayoutComponent implements OnDestroy {
  @ViewChild(SidebarComponent) appSidebar!: SidebarComponent;
  @ViewChild(SidebarComponent) appTopBar!: TopbarComponent;

  readonly #layoutService = inject(PrivateLayoutService);
  readonly #renderer = inject(Renderer2);
  readonly #router = inject(Router);

  overlayMenuOpenSubscription: Subscription;
  menuOutsideClickListener: any;

  constructor() {
    this.overlayMenuOpenSubscription = this.#layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.#renderer.listen('document', 'click', event => {
          if (this.isOutsideClicked(event)) {
            this.hideMenu();
          }
        });
      }

      if (this.#layoutService.layoutState().staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    this.#router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.hideMenu();
    });
  }

  isOutsideClicked(event: MouseEvent) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(
      sidebarEl?.isSameNode(eventTarget) ||
      sidebarEl?.contains(eventTarget) ||
      topbarEl?.isSameNode(eventTarget) ||
      topbarEl?.contains(eventTarget)
    );
  }

  hideMenu() {
    this.#layoutService.layoutState.update(prev => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'),
        ' ',
      );
    }
  }

  get containerClass() {
    return {
      'layout-overlay': this.#layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.#layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive':
        this.#layoutService.layoutState().staticMenuDesktopInactive && this.#layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active': this.#layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active': this.#layoutService.layoutState().staticMenuMobileActive,
    };
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
