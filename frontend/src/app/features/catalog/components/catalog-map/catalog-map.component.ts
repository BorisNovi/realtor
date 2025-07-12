import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { MapComponent } from '@shared/components';
import { MapMarkerComponent } from '@shared/components/map/map-marker.component';
import { getPropertyStatusColor } from '@shared/utils/property-status-severity.util';
import { LngLatBoundsLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { CatalogState } from 'src/app/core';
import { CatalogFiltersService } from '../../catalog-filters.service';

@Component({
  selector: 'rx-catalog-map',
  imports: [MapComponent, MapMarkerComponent, FormsModule, ButtonModule, TranslatePipe],
  templateUrl: './catalog-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogMapComponent {
  readonly mapComponent = viewChild(MapComponent);

  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly filtersService = inject(CatalogFiltersService);

  readonly tableDataS = this.#store.selectSignal(CatalogState.catalog);
  readonly getStatusColor = getPropertyStatusColor;

  readonly fitBounds = computed<LngLatBoundsLike | undefined>(() => {
    const positions = this.tableDataS()
      .items.map(i => i.address?.position)
      .filter((pos): pos is [number, number] => Array.isArray(pos) && pos.length === 2);

    if (positions.length === 0) return;

    const lons = positions.map(p => p[0]);
    const lats = positions.map(p => p[1]);

    const minLng = Math.min(...lons);
    const maxLng = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
  });

  showAll() {
    const map = this.mapComponent()?.map;
    const bounds = this.fitBounds();
    if (bounds && map) map.fitBounds(bounds, { maxZoom: 17, padding: 100 });
  }
}
