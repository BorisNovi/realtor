import { Component, signal, viewChild } from '@angular/core';
import { MapComponent } from '@shared/components';
import { MapMarkerComponent } from '@shared/components/map/map-marker.component';
import { LngLatLike } from 'maplibre-gl';

@Component({
  selector: 'app-map-page',
  imports: [MapComponent, MapMarkerComponent],
  templateUrl: './map-page.component.html',
})
export class MapPageComponent {
  readonly mapComponent = viewChild(MapComponent);

  readonly c = signal<LngLatLike>([41, 41]);

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
}
