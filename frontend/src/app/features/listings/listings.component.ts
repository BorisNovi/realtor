import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'rx-listings',
  imports: [RouterOutlet],
  templateUrl: './listings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsComponent {}
