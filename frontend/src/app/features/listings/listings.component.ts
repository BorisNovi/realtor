import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@shared/components';

@Component({
  selector: 'rx-listings',
  imports: [SelectComponent],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsComponent {}
