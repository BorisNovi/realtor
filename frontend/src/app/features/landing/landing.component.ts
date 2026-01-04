import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'rx-landing',
  imports: [RouterLink, ButtonModule],
  providers: [],
  templateUrl: 'landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {}