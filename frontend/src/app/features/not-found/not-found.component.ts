import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfiguratorComponent } from 'src/app/layouts/private-layout/components';

@Component({
  selector: 'rx-not-found',
  imports: [RouterModule, ButtonModule, TranslatePipe, ConfiguratorComponent],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
