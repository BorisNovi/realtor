import { Component, DestroyRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GeocodeFeature } from '@shared/interfaces';
import { IPickerAddress } from '@shared/interfaces/picker-address.interface';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { GeocodeService } from 'src/app/core';
import { getCurrentLocation, MapHelper } from '../../utils';
import { MapMarkerComponent } from '../map/map-marker.component';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'rx-address-picker',
  imports: [
    FormsModule,
    MapComponent,
    MapMarkerComponent,
    ButtonModule,
    InputText,
    InputGroup,
    InputGroupAddonModule,
    TooltipModule,
    TranslatePipe,
  ],
  templateUrl: './address-picker.component.html',
})
export class AddressPickerComponent implements OnInit {
  readonly mapComponent = viewChild(MapComponent);

  readonly #geo = inject(GeocodeService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #translateService = inject(TranslateService);

  readonly mapCenter = signal<LngLatLike>([0, 0]);

  readonly addressQuery = signal<string>('');
  readonly markerPosition = signal<LngLatLike>([0, 0]);
  readonly popupTitle = signal<string | { name: string; value: string }[] | null>(null);
  readonly posToShow = signal<LngLatLike>([0, 0]);
  readonly scrollZooomDisabled = signal<boolean>(true);

  readonly pickedAddress = signal<IPickerAddress | null>(null);
  readonly address = output<IPickerAddress | null>();

  readonly normalizeLngLat = MapHelper.normalizeLngLat;

  ngOnInit(): void {
    this.updateLocation();
    this.popupTitle.set(this.#translateService.instant('ADDRESS_PICKER.POPUP.DEFAULT'));

    this.mapComponent()
      ?.mapReady$.pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((map: maplibregl.Map) => {
        map.getCanvas().style.cursor = 'pointer';
        map.on('drag', () => (map.getCanvas().style.cursor = 'grabbing'));
        map.on('dragend', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('click', e => {
          const lngLat: LngLatLike = [e.lngLat.lng, e.lngLat.lat];

          this.markerPosition.set(lngLat);
          this.posToShow.set(lngLat);
          this.reverse(lngLat);
          map.flyTo({ center: lngLat, zoom: 15 });
        });
      });
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
        this.markerPosition.set(this.mapCenter());
        this.posToShow.set(this.mapCenter());
        this.popupTitle.set(this.#translateService.instant('ADDRESS_PICKER.POPUP.GEO_DISABLED'));
        this.mapComponent()?.map.setZoom(2);
      });
  }

  search(): void {
    const address = this.addressQuery();
    if (!address) return;
    this.#geo
      .geocode(address)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(result => {
        const feat = result?.features?.[0];
        const lngLat = feat?.geometry?.coordinates;
        if (!lngLat || lngLat.length < 2) this.popupTitle.set(this.#translateService.instant('ADDRESS_PICKER.POPUP.NOT_FOUND'));

        this.prepareOutput(feat);
        this.markerPosition.set(lngLat);
        this.posToShow.set(lngLat);
        this.mapComponent()?.map.flyTo({ center: lngLat, zoom: 15 });
      });
  }

  reverse(lngLat: LngLatLike): void {
    this.#geo
      .reverse(lngLat)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(result => {
        const feat = result?.features?.[0];
        this.prepareOutput(feat);
      });
  }

  prepareOutput(feature: GeocodeFeature): void {
    const address = feature?.properties?.address;
    this.popupTitle.set([
      { name: this.#translateService.instant('ADDRESS_PICKER.POPUP.CITY'), value: address?.city || '-' },
      { name: this.#translateService.instant('ADDRESS_PICKER.POPUP.ROAD'), value: address?.road || '-' },
      { name: this.#translateService.instant('ADDRESS_PICKER.POPUP.HOUSE'), value: address?.house_number || '-' },
    ]);

    this.pickedAddress.set({
      coordinates: feature?.geometry?.coordinates || null,
      address: address || null,
      name: feature?.properties.display_name || null,
    });
  }

  fillPickedAddress(): void {
    this.address.emit(this.pickedAddress());
  }
}
