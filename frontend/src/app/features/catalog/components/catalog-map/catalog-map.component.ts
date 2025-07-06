import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { MapComponent } from '@shared/components';
import { MapMarkerComponent } from '@shared/components/map/map-marker.component';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { CatalogFiltersService } from '../../catalog-filters.service';
import { CatalogState } from 'src/app/core';
import { getPropertyStatusBackground, getPropertyStatusSeverity } from '@shared/utils';
import { getPropertyStatusColor } from '@shared/utils/property-status-severity.util';

@Component({
  selector: 'rx-catalog-map',
  imports: [MapComponent, MapMarkerComponent, FormsModule, ButtonModule, TranslatePipe],
  templateUrl: './catalog-map.component.html',
})
export class CatalogMapComponent {
  readonly mapComponent = viewChild(MapComponent);

  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly filtersService = inject(CatalogFiltersService);

  readonly tableDataS = this.#store.selectSignal(CatalogState.catalog);
  readonly center = signal<LngLatLike>([41.6, 41.6]);

  readonly getStatusColor = getPropertyStatusColor;

  on1(): void {
    this.mapComponent()?.map.setZoom(7);
    this.mapComponent()?.map.panTo([41.649008, 41.641028]);
  }
}
