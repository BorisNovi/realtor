import { CommonModule } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { GeocodeService } from 'src/app/core';
import { MapMarkerComponent } from '../map/map-marker.component';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-address-picker',
  imports: [
    CommonModule,
    FormsModule,
    MapComponent,
    MapMarkerComponent,
    ButtonModule,
    InputText,
    InputGroup,
    InputGroupAddonModule,
  ],
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent {
  readonly mapComponent = viewChild(MapComponent);

  readonly #geo = inject(GeocodeService);

  readonly mapCenter = signal<LngLatLike>([41.6, 41.6]);
  readonly address = signal<string>('');
  readonly markerPosition = signal<LngLatLike>([41.642414, 41.635242]);

  onMarkerDrag(markerPos: LngLatLike): void {
    console.log(markerPos);
  }

  search(): void {
    this.#geo.geocode(this.address()).subscribe(data => {
      console.log(data);
      const coords = data?.features?.[0]?.geometry?.coordinates;
      if (!coords || coords.length < 2) return;

      this.markerPosition.set(coords);
      this.mapComponent()?.map.flyTo({ center: coords, zoom: 15 });
    });
  }
}
