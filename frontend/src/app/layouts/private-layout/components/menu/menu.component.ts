import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuitemComponent } from '../menuitem/menuitem.component';

@Component({
  selector: 'rx-menu',
  imports: [MenuitemComponent, RouterModule],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        visible: true,
        label: 'MENU.CATALOG',
        items: [
          { label: 'MENU.LIST', icon: 'pi pi-fw pi-list', routerLink: ['/app/catalog/list'], queryParamsHandling: 'preserve' },
          { label: 'MENU.MAP', icon: 'pi pi-fw pi-map', routerLink: ['/app/catalog/map'], queryParamsHandling: 'preserve' },
        ],
      },
      {
        label: 'MENU.SHARING',
        items: [{ label: 'MENU.LISTINGS', icon: 'pi pi-fw pi-list-check', routerLink: ['/app/listings'] }],
      },
      {
        label: 'AI',
        visible: false,
        items: [
          { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/'], visible: false },
          { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/'] },
          { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: [''] },
        ],
      },
      {
        label: 'MENU.INFO',
        items: [{ label: 'MENU.CONTACTS', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/contacts'] }],
      },
      {
        label: 'Analytics',
        visible: false,
        // icon: 'pi pi-fw pi-briefcase',
        // routerLink: ['/pages'],
        items: [
          { label: 'Analysis', icon: 'pi pi-fw pi-chart-bar', routerLink: [''] },
          { label: 'Plans', icon: 'pi pi-fw pi-calendar', routerLink: [''] },
          {
            visible: false,
            label: 'Landing',
            icon: 'pi pi-fw pi-globe',
            routerLink: ['/landing'],
          },
          {
            visible: false,
            label: 'Auth',
            icon: 'pi pi-fw pi-user',
            items: [
              {
                label: 'Login',
                icon: 'pi pi-fw pi-sign-in',
                routerLink: ['/auth/login'],
              },
              {
                label: 'Error',
                icon: 'pi pi-fw pi-times-circle',
                routerLink: ['/auth/error'],
              },
              {
                label: 'Access Denied',
                icon: 'pi pi-fw pi-lock',
                routerLink: ['/auth/access'],
              },
            ],
          },
        ],
      },
    ];
  }
}
