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
        label: 'Catalog',
        items: [
          { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['catalog/list'], queryParamsHandling: 'preserve' },
          { label: 'Map', icon: 'pi pi-fw pi-map', routerLink: ['catalog/map'], queryParamsHandling: 'preserve' },
        ],
      },
      {
        label: 'Sharing',
        items: [{ label: 'Listings', icon: 'pi pi-fw pi-list-check', routerLink: ['/listings'] }],
      },
      {
        label: 'AI',
        items: [
          { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/'], visible: false },
          { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/'] },
          { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: [''] },
        ],
      },
      {
        label: 'Info',
        items: [{ label: 'Contacts', icon: 'pi pi-fw pi-id-card', routerLink: ['/'] }],
      },
      {
        label: 'Analytics',
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
            visible: true,
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
