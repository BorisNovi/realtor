import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { GeocodeService } from 'src/app/core';
import { getCurrentLocation } from '../../utils';
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
export class AddressPickerComponent implements OnInit {
  readonly mapComponent = viewChild(MapComponent);

  readonly #geo = inject(GeocodeService);

  readonly mapCenter = signal<LngLatLike>([12.4, 41.8]);

  readonly address = signal<string>('');
  readonly markerPosition = signal<LngLatLike>([41.642414, 41.635242]);

  ngOnInit(): void {
    this.updateLocation();
  }

  onMarkerDrag(markerPos: LngLatLike): void {
    console.log(markerPos);
  }

  updateLocation(flyTo = false): void {
    getCurrentLocation()
      .then(lngLat => {
        this.markerPosition.set(lngLat);
        if (flyTo) this.mapComponent()?.map.flyTo({ center: lngLat, zoom: 15 });
        else this.mapCenter.set(lngLat);
      })
      .catch(err => {
        console.warn('Could not get position:', err);
      });
  }

  search(): void {
    const address = this.address();
    if (!address) return;
    this.#geo.geocode(address).subscribe(data => {
      console.log(data);
      const coords = data?.features?.[0]?.geometry?.coordinates;
      if (!coords || coords.length < 2) return;

      this.markerPosition.set(coords);
      this.mapComponent()?.map.flyTo({ center: coords, zoom: 15 });
    });
  }
}
