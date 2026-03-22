import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { MapComponent } from '@shared/components';
import { PropertyStatus } from '@shared/enums';
import { ICatalogItem, IMapBox, IPropertyObject } from '@shared/interfaces';
import { getCurrentLocation, MapHelper } from '@shared/utils';
import { getMapPropertyStatusColor } from '@shared/utils/property-status-severity.util';
import GeoJSON from 'geojson';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { distinctUntilChanged, skip, tap } from 'rxjs';
import {
  CatalogState,
  DeletePropertyObjects,
  DeletionConfirmationService,
  FetchCatalogMap,
  FetchPropertyObject,
  StorageService,
} from 'src/app/core';
import { CatalogFiltersService } from '../../catalog-filters.service';
import { AddToListingComponent } from '../add-to-listing/add-to-listing.component';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';
import { CatalogMapDrawerComponent } from './catalog-map-drawer.component';

@Component({
  selector: 'rx-catalog-map',
  imports: [MapComponent, FormsModule, ButtonModule, TranslatePipe, ConfirmDialog, CatalogMapDrawerComponent],
  providers: [DialogService],
  templateUrl: './catalog-map.component.html',
  styleUrl: './catalog-map.component.scss',
  animations: [SLIDE],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogMapComponent implements AfterViewInit {
  readonly mapComponent = viewChild(MapComponent);

  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly #location = inject(Location);
  readonly #route = inject(ActivatedRoute);
  readonly filtersService = inject(CatalogFiltersService);
  readonly #translateService = inject(TranslateService);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly #dialogService = inject(DialogService);
  readonly #storageService = inject(StorageService);

  readonly tableDataS = this.#store.selectSignal(CatalogState.mapCatalog);
  readonly selectedItem = signal<ICatalogItem | null>(null);
  readonly drawerOpen = signal(false);

  readonly detailedCache = signal<Record<number, IPropertyObject | null>>({});
  readonly detailedSelected = signal<IPropertyObject | null>(null);

  #ref!: DynamicDialogRef | null;

  // Можно переделать в массив
  readonly mapImages = {
    flat_available: 'assets/map-icons/flat_available.png',
    flat_reserved: 'assets/map-icons/flat_reserved.png',
    flat_rented: 'assets/map-icons/flat_rented.png',

    house_available: 'assets/map-icons/house_available.png',
    house_reserved: 'assets/map-icons/house_reserved.png',
    house_rented: 'assets/map-icons/house_rented.png',

    room_available: 'assets/map-icons/room_available.png',
    room_reserved: 'assets/map-icons/room_reserved.png',
    room_rented: 'assets/map-icons/room_rented.png',

    office_available: 'assets/map-icons/office_available.png',
    office_reserved: 'assets/map-icons/office_reserved.png',
    office_rented: 'assets/map-icons/office_rented.png',

    land_available: 'assets/map-icons/land_available.png',
    land_reserved: 'assets/map-icons/land_reserved.png',
    land_rented: 'assets/map-icons/land_rented.png',
  };

  readonly minMapZoom = Number(this.#storageService.getItem('catalog-map-zoom')) || MapHelper.ZOOM_CITY;

  constructor() {
    toObservable(this.tableDataS)
      .pipe(takeUntilDestroyed(), skip(2), distinctUntilChanged())
      .subscribe(() => this.#setData());
  }

  ngAfterViewInit(): void {
    const map = this.mapComponent()?.map;
    if (!map) return;

    map.setMinZoom(MapHelper.ZOOM_CITY);
    map.on('load', () => this.#onMapLoad(map));
    this.#setupMapEvents(map);
  }

  #onMapLoad(map: maplibregl.Map): void {
    const targetId = this.#route.snapshot.paramMap.get('id');

    if (targetId) {
      this.#store
        .dispatch(new FetchPropertyObject(Number(targetId)))
        .pipe(
          tap(() => {
            const item = this.#store.selectSnapshot(CatalogState.propertyObject);
            if (!item) return;

            if (item.address?.position) {
              const { lng, lat } = MapHelper.normalizeLngLat(item.address.position);
              map.setCenter([lng, lat]);
              map.setZoom(MapHelper.ZOOM_STREET);
            }

            this.detailedCache.set({ [item.id]: item });
            this.onMarkerClick(item as ICatalogItem);
          }),
          takeUntilDestroyed(this.#destroyRef),
        )
        .subscribe();
    } else {
      getCurrentLocation()
        .then(lngLat => {
          (map.setCenter(lngLat), map.setZoom(this.minMapZoom));
        })
        .catch(err => console.warn('Could not get position:', err));
    }

    // For slow PCs
    new Promise<void>(resolve => map.once('idle', resolve)).then(() => this.#setData());
  }

  #setupMapEvents(map: maplibregl.Map): void {
    // Cluster zoom
    map.on('click', 'objects-clusters', async e => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['objects-clusters'] });
      const source = map.getSource('objects') as maplibregl.GeoJSONSource;
      try {
        const zoom = await source.getClusterExpansionZoom(features[0].properties?.['cluster_id']);
        map.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as LngLatLike, zoom });
      } catch (err) {
        console.error(err);
      }
    });

    // Hover popup
    let hoverPopup: maplibregl.Popup | null = null;
    map.on('mouseenter', 'objects-unclustered-point', e => {
      map.getCanvas().style.cursor = 'pointer';
      const item = JSON.parse(e.features?.[0].properties['raw']) as IPropertyObject;

      hoverPopup?.remove();
      hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnMove: true })
        .setLngLat(e.lngLat)
        .setHTML(
          `
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.COUNTRY')}</strong>: ${item.address.country}</div>
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.STATE')}</strong>: ${item.address.state || '-'}</div>
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.CITY')}</strong>: ${item.address.city}</div>
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.ROAD')}</strong>: ${item.address.road}</div>
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.HOUSE')}</strong>: ${item.address.house}</div>
          `,
        )
        .addTo(map);
    });

    map.on('mouseout', 'objects-unclustered-point', () => {
      map.getCanvas().style.cursor = '';
      hoverPopup?.remove();
      hoverPopup = null;
    });

    // Marker click → drawer
    map.on('click', 'objects-unclustered-point', e => {
      const item = JSON.parse(e.features?.[0].properties['raw']) as IPropertyObject;
      this.onMarkerClick(item);
    });

    map.on('zoom', e => this.#storageService.setItem('catalog-map-zoom', e.target.getZoom().toFixed(1)));
  }

  onMapBoxChange(box: IMapBox): void {
    this.#store.dispatch(new FetchCatalogMap(box));
  }

  #setData(): void {
    const features: GeoJSON.Feature[] = this.tableDataS()
      .items.map(item => {
        const pos = item.address?.position;
        if (Array.isArray(pos) && pos.length === 2) {
          const coordinates = pos as GeoJSON.Position;

          return {
            type: 'Feature',
            id: item.id,
            geometry: { type: 'Point', coordinates },
            properties: {
              id: item.id,
              color: getMapPropertyStatusColor(item.status),
              marker_type: `${item.propertyType.toLowerCase()}_${item.status.toLowerCase()}`,
              raw: item,
              cnt_available: item.status === PropertyStatus.available ? 1 : 0,
              cnt_reserved: item.status === PropertyStatus.reserved ? 1 : 0,
              cnt_rented: item.status === PropertyStatus.rented ? 1 : 0,
            },
          } as GeoJSON.Feature;
        }
        return null;
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    this.mapComponent()?.addClusteredSource('objects', {
      type: 'FeatureCollection',
      features,
    });
  }

  updateLocation(): void {
    getCurrentLocation()
      .then(lngLat => this.mapComponent()?.map.flyTo({ center: lngLat, zoom: MapHelper.ZOOM_DISTRICT }))
      .catch(err => console.warn('Could not get position:', err));
  }

  onDrawerClose(): void {
    this.drawerOpen.set(false);
    this.#location.replaceState('/catalog/map');
  }

  onMarkerClick(item: ICatalogItem): void {
    this.selectedItem.set(item);
    this.drawerOpen.set(true);
    if (item.id) {
      this.#location.replaceState(`/catalog/map/${item.id}`);
      this.#loadDetailedItem(item.id);
    }
  }

  deleteItem(id: number): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new DeletePropertyObjects([id]));
    });
  }

  edit(id: number): void {
    this.#store
      .dispatch(new FetchPropertyObject(id))
      .pipe(
        tap(() => {
          const propertyData = this.#store.selectSnapshot(CatalogState.propertyObject);
          if (propertyData) {
            this.openEditDialog(propertyData);
          }
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  openAddToListingDialog(id: number): void {
    this.#ref = this.#dialogService.open(AddToListingComponent, {
      data: id,
      header: this.#translateService.instant('LISTINGS.ACTIONS.ADD_OBJECT'),
      width: '370px',
      height: '300px',
      dismissableMask: true,
      modal: true,
      closable: true,
      focusOnShow: false,
    });
  }

  openEditDialog(item: ICatalogItem): void {
    this.#ref = this.#dialogService.open(CreateCatalogItemComponent, {
      data: item,
      header: this.#translateService.instant('CATALOG.TABLE.DIALOG.EDIT'),
      width: '50vw',
      modal: true,
      closable: true,
      dismissableMask: true,
      contentStyle: { overflow: 'auto' },
      focusOnShow: false,
      breakpoints: {
        '960px': '75vw',
        '768px': '90vw',
        '640px': '95vw',
      },
    });

    this.#ref?.onClose.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      this.#refreshMapData();
    });
  }

  #refreshMapData(): void {
    const map = this.mapComponent()?.map;
    if (!map) return;

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    this.#store.dispatch(new FetchCatalogMap({ minLng: sw.lng, minLat: sw.lat, maxLng: ne.lng, maxLat: ne.lat }));
  }

  #loadDetailedItem(id: number): void {
    this.detailedSelected.set(null);

    const cache = this.detailedCache();
    if (cache[id]) {
      this.detailedSelected.set(cache[id]);
      return;
    }

    this.#store
      .dispatch(new FetchPropertyObject(id))
      .pipe(
        tap(() => {
          const propertyData = this.#store.selectSnapshot(CatalogState.propertyObject);
          if (propertyData) {
            this.detailedCache.set({ ...this.detailedCache(), [id]: propertyData });
            this.detailedSelected.set(propertyData);
          }
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }
}
