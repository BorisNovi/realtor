import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rx-width-tester',
  imports: [],
  templateUrl: './width-tester.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidthTesterComponent {}
