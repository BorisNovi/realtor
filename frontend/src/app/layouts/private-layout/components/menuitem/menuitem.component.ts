import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { filter } from 'rxjs';
import { PrivateLayoutService } from '../../shared';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[rx-menuitem]',
  imports: [CommonModule, RouterModule, RippleModule, TranslatePipe],
  templateUrl: './menuitem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('children', [
      state(
        'collapsed',
        style({
          height: '0',
        }),
      ),
      state(
        'expanded',
        style({
          height: '*',
        }),
      ),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
    ]),
  ],
})
export class MenuitemComponent implements OnInit {
  readonly #router = inject(Router);
  readonly #layoutService = inject(PrivateLayoutService);

  readonly item = input<MenuItem>();
  readonly index = input<number>();
  readonly parentKey = input<string>();
  readonly root = input<boolean>();

  @HostBinding('class.layout-root-menuitem')
  get rootClass() {
    return this.root();
  }

  #active = false;

  readonly patternActiveRoute = signal(false);

  readonly key = computed(() => {
    const i = this.index();
    const pKey = this.parentKey();
    return pKey ? pKey + '-' + i : String(i);
  });

  constructor() {
    this.#layoutService.menuSource$.pipe(takeUntilDestroyed()).subscribe(value => {
      Promise.resolve(null).then(() => {
        if (value.routeEvent) {
          this.#active = value.key === this.key() || value.key.startsWith(this.key() + '-');
        } else {
          if (value.key !== this.key() && !value.key.startsWith(this.key() + '-')) {
            this.#active = false;
          }
        }
      });
    });

    this.#layoutService.resetSource$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.#active = false;
    });

    this.#router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updateActiveState());
  }

  ngOnInit() {
    this.updateActiveState();
  }

  updateActiveState() {
    const item = this.item();

    if (item?.routerLink) {
      const activeRoute = this.#router.isActive(item.routerLink[0], {
        paths: item.routerLinkActiveOptions?.paths ?? 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      });
      if (activeRoute) {
        this.#layoutService.onMenuStateChange({ key: this.key(), routeEvent: true });
      }
    }

    const pattern = item?.state?.['activeUrlPattern'];
    if (pattern) {
      const url = this.#router.url.split('?')[0];
      this.patternActiveRoute.set(new RegExp(pattern).test(url));
    }
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    const item = this.item();
    if (item?.disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (item?.command) {
      item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (item?.items) {
      this.#active = !this.#active;
    }

    this.#layoutService.onMenuStateChange({ key: this.key() });
  }

  get submenuAnimation() {
    return this.root() ? 'expanded' : this.#active ? 'expanded' : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.#active && !this.root();
  }
}
