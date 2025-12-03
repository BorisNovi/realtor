import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { MapComponent } from '@shared/components';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { ICatalogItem, IPropertyObject } from '@shared/interfaces';
import { CamelToUpperSnakePipe, WorldPhoneMaskPipe } from '@shared/pipes';
import {
  getMapPropertyStatusColor,
  getPropertyStatusColor,
  getPropertyStatusSeverity,
} from '@shared/utils/property-status-severity.util';
import GeoJSON from 'geojson';
import maplibregl, { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GalleriaModule } from 'primeng/galleria';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { distinctUntilChanged, skip, tap } from 'rxjs';
import { CatalogState, DeletePropertyObjects, DeletionConfirmationService, FetchPropertyObject } from 'src/app/core';
import { CatalogFiltersService } from '../../catalog-filters.service';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';

@Component({
  selector: 'rx-catalog-map',
  imports: [
    MapComponent,
    FormsModule,
    ButtonModule,
    TranslatePipe,
    DrawerModule,
    GalleriaModule,
    ConfirmDialog,
    TagModule,
    DividerModule,
    ProgressBarModule,
    CamelToUpperSnakePipe,
    WorldPhoneMaskPipe,
  ],
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
  readonly filtersService = inject(CatalogFiltersService);
  readonly #translateService = inject(TranslateService);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly #dialogService = inject(DialogService);

  readonly tableDataS = this.#store.selectSignal(CatalogState.catalog);
  readonly getStatusColor = getPropertyStatusColor;
  readonly selectedItem = signal<ICatalogItem | null>(null);
  readonly drawerOpen = signal(false);

  readonly detailedCache = signal<Record<number, IPropertyObject | null>>({});
  readonly detailedSelected = signal<IPropertyObject | null>(null);

  readonly getSeverity = getPropertyStatusSeverity;
  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  #ref!: DynamicDialogRef | null;

  // TODO: Помтом убрать. Сделанно временно, пока с бэка не возвращаются фото в { image: string; thumbnail: string; }[]
  readonly imagesTemp = computed(() => this.selectedItem()?.photos.map(p => ({ image: p, thumbnail: p })));

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

  readonly optionsArray = computed(() => {
    const options = this.detailedSelected()?.specifics?.options;
    if (!options) return [];

    return Object.entries(options)
      .map(([category, values]) => ({
        category,
        values: Object.entries(values as Record<string, boolean>).filter(opt => opt[1]),
      }))
      .filter(group => group.values.length > 0);
  });

  // Можно переделать в массив
  readonly mapImages = {
    marker: 'assets/map-images/marker.png',
    flat_available: 'assets/map-images/marker.png',
    flat_reserved: 'assets/flat_reserved.png',
    flat_rented: 'assets/flat_rented.png',

    house_available: 'test',
    house_reserved: 'test',
    house_rented: 'test',

    room_available: 'test',
    room_reserved: 'test',
    room_rented: 'test',

    office_available: 'test',
    office_reserved: 'test',
    office_rented: 'test',

    land_available: 'test',
    land_reserved: 'test',
    land_rented: 'test',
  };

  constructor() {
    toObservable(this.tableDataS)
      .pipe(takeUntilDestroyed(), skip(1), distinctUntilChanged())
      .subscribe(() => this.#setData());
  }

  ngAfterViewInit(): void {
    const map = this.mapComponent()?.map;
    if (!map) return;

    map.on('load', () => this.#setData());

    // Cluster zoom
    map.on('click', 'objects-clusters', async e => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['objects-clusters'],
      });
      const source = map.getSource('objects') as maplibregl.GeoJSONSource;
      try {
        const zoom = await source.getClusterExpansionZoom(features[0].properties?.['cluster_id']);
        map.easeTo({ center: (features[0].geometry as GeoJSON.Point).coordinates as LngLatLike, zoom });
      } catch (err) {
        console.error(err);
      }
    });

    // Popup create and open
    let hoverPopup: maplibregl.Popup | null = null;
    map.on('mouseenter', 'objects-unclustered-point', e => {
      map.getCanvas().style.cursor = 'pointer';
      const item = JSON.parse(e.features?.[0].properties['raw']) as IPropertyObject;

      if (hoverPopup) {
        hoverPopup.remove();
        hoverPopup = null;
      }

      hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnMove: true })
        .setLngLat(e.lngLat)
        .setHTML(
          `
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.CITY')}</strong>: ${item.address.city}</div>
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.ROAD')}</strong>: ${item.address.road}</div>
          <div><strong>${this.#translateService.instant('ADDRESS_PICKER.POPUP.HOUSE')}</strong>: ${item.address.house}</div>
          `,
        )
        .addTo(map);
    });

    // Popup close
    map.on('mouseout', 'objects-unclustered-point', () => {
      map.getCanvas().style.cursor = '';
      if (hoverPopup) {
        hoverPopup.remove();
        hoverPopup = null;
      }
    });

    // Drawer with details open
    map.on('click', 'objects-unclustered-point', e => {
      const item = JSON.parse(e.features?.[0].properties['raw']) as IPropertyObject;
      this.onMarkerClick(item);
    });
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
            geometry: {
              type: 'Point',
              coordinates,
            },
            properties: {
              id: item.id,
              color: getMapPropertyStatusColor(item.status),
              marker_type: `${item.propertyType.toLowerCase()}_${item.status.toLowerCase()}`,
              raw: item,
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

  showAll() {
    const map = this.mapComponent()?.map;
    const bounds = this.fitBounds();
    if (bounds && map) map.fitBounds(bounds, { maxZoom: 17, padding: 100 });
  }

  onMarkerClick(item: ICatalogItem): void {
    this.selectedItem.set(item);
    this.drawerOpen.set(true);
    if (item.id) this.loadDetailedItem(item.id);
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

  openEditDialog(item: ICatalogItem): void {
    this.#ref = this.#dialogService.open(CreateCatalogItemComponent, {
      data: item,
      header: this.#translateService.instant('CATALOG.TABLE.DIALOG.EDIT'),
      width: '50vw',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      focusOnShow: false,
      breakpoints: {
        '960px': '75vw',
        '768px': '90vw',
        '640px': '95vw',
      },
    });
  }

  private loadDetailedItem(id: number) {
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
