import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfiguratorComponent } from 'src/app/layouts/private-layout/components';

@Component({
  selector: 'rx-auth',
  imports: [RouterOutlet, ConfiguratorComponent],
  providers: [],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {}
