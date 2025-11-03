import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListingsTableComponent } from './components/listings-table/listing-table.component';

@Component({
  selector: 'rx-listings',
  imports: [ListingsTableComponent],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsComponent {}
