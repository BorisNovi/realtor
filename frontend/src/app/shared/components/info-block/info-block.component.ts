import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'rx-info-block',
  imports: [TranslatePipe],
  templateUrl: './info-block.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBlockComponent {}
