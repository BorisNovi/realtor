import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { GeocodeService } from 'src/app/core';
import { getCurrentLocation, normalizeLngLat } from '../../utils';
import { MapMarkerComponent } from '../map/map-marker.component';
import { MapComponent } from '../map/map.component';
import { GeocodeFeature } from '@shared/interfaces';

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

  readonly mapCenter = signal<LngLatLike>([0, 0]);

  readonly addressQuery = signal<string>('');
  readonly markerPosition = signal<LngLatLike>([0, 0]);
  readonly popupTitle = signal<string | null>(null);
  readonly posToShow = signal<LngLatLike>([0, 0]);

  readonly address = output<any>();

  readonly normalizeLngLat = normalizeLngLat;

  ngOnInit(): void {
    this.updateLocation();
    this.popupTitle.set('geocoded address');
  }

  onMarkerDrag(markerPos: LngLatLike): void {
    this.posToShow.set(markerPos);
    this.reverse(markerPos);
  }

  updateLocation(flyTo = false): void {
    getCurrentLocation()
      .then(lngLat => {
        this.markerPosition.set(lngLat);
        this.posToShow.set(lngLat);
        this.reverse(lngLat);
        if (flyTo) this.mapComponent()?.map.flyTo({ center: lngLat, zoom: 15 });
        else this.mapCenter.set(lngLat);
      })
      .catch(err => {
        console.warn('Could not get position:', err);
      });
  }

  search(): void {
    const address = this.addressQuery();
    if (!address) return;
    this.#geo.geocode(address).subscribe(result => {
      const feat = result?.features?.[0];
      const lngLat = feat?.geometry?.coordinates;
      if (!lngLat || lngLat.length < 2) this.popupTitle.set('Nothig found');

      this.setOutput(feat);
      this.markerPosition.set(lngLat);
      this.posToShow.set(lngLat);
      this.mapComponent()?.map.flyTo({ center: lngLat, zoom: 15 });
    });
  }

  reverse(lngLat: LngLatLike): void {
    this.#geo.reverse(lngLat).subscribe(result => {
      const feat = result?.features?.[0];
      this.setOutput(feat);
    });
  }

  // TODO: Сделать тип для адреса и режим ручного ввода. Автоперключение карты на языки приложения
  setOutput(feature: GeocodeFeature): void {
    this.popupTitle.set(feature?.properties.display_name || null);
    this.address.emit({
      coordinates: feature?.geometry?.coordinates || null,
      address: feature?.properties?.address || null,
      name: feature?.properties.display_name || null,
    });
  }
}
