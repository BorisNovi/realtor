import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'rx-landing',
  imports: [RouterLink, ButtonModule],
  providers: [],
  templateUrl: 'landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  constructor() {
    inject(Title).setTitle('Urban CRM');
    inject(Meta).addTags([
      { name: 'description', content: 'Modern CRM for real estate agents' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Urban CRM' },
      { property: 'og:description', content: 'Modern CRM for real estate agents' },
      { property: 'og:image', content: '/assets/og-preview.png' },
    ]);
  }
}
