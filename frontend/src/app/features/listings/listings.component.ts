import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rx-listings',
  imports: [],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsComponent {
}
