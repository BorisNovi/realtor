import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, Renderer2 } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ConfiguratorComponent, FooterComponent } from '../private-layout/components';
// import { FooterComponent, SidebarComponent, TopbarComponent } from './components';
// import { PrivateLayoutService } from './shared';

@Component({
  selector: 'rx-public-layout',
  // imports: [RouterOutlet, CommonModule, TopbarComponent, SidebarComponent, FooterComponent],
  imports: [RouterOutlet, CommonModule, FooterComponent, ConfiguratorComponent],
  templateUrl: 'public-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent implements OnDestroy {
  // readonly #layoutService = inject(PrivateLayoutService);
  readonly #renderer = inject(Renderer2);
  readonly #router = inject(Router);

  constructor() {}

  ngOnDestroy() {}
}
