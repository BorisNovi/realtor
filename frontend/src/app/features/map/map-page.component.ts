import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '@shared/components';
import { MapMarkerComponent } from '@shared/components/map/map-marker.component';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { GeocodeService } from 'src/app/core';

@Component({
  selector: 'rx-map-page',
  imports: [MapComponent, MapMarkerComponent, FormsModule, ButtonModule, InputText, InputGroup, InputGroupAddonModule],
  templateUrl: './map-page.component.html',
})
export class MapPageComponent {
  readonly mapComponent = viewChild(MapComponent);

  readonly #geo = inject(GeocodeService);

  readonly c = signal<LngLatLike>([41.6, 41.6]);
  readonly address = signal<string>('');
  readonly foundMarker = signal<LngLatLike | null>(null);

  // XXX: Здесь пока все тестовое, оно не пойдет в прод
  on1(): void {
    this.mapComponent()?.map.setZoom(7);
    this.mapComponent()?.map.panTo([41.649008, 41.641028]);
  }

  on2(): void {
    this.c.set([16, 11]);
  }

  on3(data: any): void {
    console.log(data);
  }

  onGeocode(): void {
    this.#geo.geocode(this.address()).subscribe(data => {
      console.log(data);
      const coords = data?.features?.[0]?.geometry?.coordinates;
      if (!coords || coords.length < 2) return;

      this.foundMarker.set(coords);
      this.mapComponent()?.map.flyTo({ center: coords, zoom: 13 });
    });
  }
}
