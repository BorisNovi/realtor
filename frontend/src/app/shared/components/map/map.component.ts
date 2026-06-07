import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { environment } from '@environments/environment';
import { generateClusterRingIcon } from '@shared/utils/cluster-ring-icon.util';
import maplibregl, { LngLatBoundsLike, LngLatLike, MapStyleImageMissingEvent } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { ReplaySubject } from 'rxjs';
import { PrivateLayoutService } from 'src/app/layouts/private-layout/shared';

@Component({
  selector: 'rx-map',
  imports: [ButtonModule],
  templateUrl: 'map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {
  readonly center = input<LngLatLike | undefined>(undefined);
  readonly bounds = input<LngLatBoundsLike | undefined>(undefined);
  readonly zoom = input<number>(3);
  readonly images = input<Record<string, string>>({});
  readonly scrollZoomDisabled = input(false, { transform: v => v === '' || !!v });
  readonly currentBox = output<{ minLng: number; minLat: number; maxLng: number; maxLat: number }>();

  readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
  readonly layoutService = inject(PrivateLayoutService);

  readonly #mapS = signal<maplibregl.Map | null>(null);
  readonly mapReady$ = new ReplaySubject<maplibregl.Map>(1);

  #sources: Record<string, GeoJSON.FeatureCollection> = {};

  get map(): maplibregl.Map {
    const m = this.#mapS();
    if (!m) throw new Error('Map is not ready yet');
    return m;
  }

  constructor() {
    effect(() => {
      const c = this.center();
      if (this.#mapS() && c) this.map?.setCenter(c);
    });
    effect(() => {
      const b = this.bounds();
      if (this.#mapS() && b) this.map?.fitBounds(b, { maxZoom: 17, padding: 100 });
    });
    effect(() => {
      const map = this.#mapS();
      const z = this.zoom();
      if (map && z) map.setZoom(z);
    });
    effect(() => {
      const map = this.#mapS();
      const dt = this.layoutService.isDarkTheme();
      if (map) map.setStyle(dt ? environment.tilesDarkUrl : environment.tilesLightUrl);
      map?.once('styledata', () => {
        this.#restoreSourcesAndLayers();
      });
    });
    effect(() => {
      const map = this.#mapS();
      const sz = this.scrollZoomDisabled();
      if (map && sz) map.scrollZoom.disable();
      if (map && !sz) map.scrollZoom.enable();
    });
  }

  ngAfterViewInit(): void {
    const map = new maplibregl.Map({
      container: this.#host.nativeElement,
      // cooperativeGestures: true,
      style: environment.tilesDarkUrl,
      center: this.center(),
      bounds: this.bounds(),
      zoom: this.zoom(),
    });

    this.#mapS.set(map);
    this.mapReady$.next(map);
    this.#addImages(this.images());

    map.on('moveend', () => {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      this.currentBox.emit({ minLng: sw.lng, minLat: sw.lat, maxLng: ne.lng, maxLat: ne.lat });
    });

    // Генерация ring chart иконок для кластеров + восстановление статических иконок
    map.on('styleimagemissing', (e: MapStyleImageMissingEvent) => {
      const id = e.id;

      if (id.startsWith('cluster-')) {
        const parts = id.replace('cluster-', '').split('-').map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return;
        const [available, reserved, rented] = parts;
        const imageData = generateClusterRingIcon({ available, reserved, rented });
        map.addImage(id, imageData);
        return;
      }

      const src = this.images()[id];
      if (src) {
        map.loadImage(src).then(img => {
          if (!map.hasImage(id)) map.addImage(id, img.data);
        });
      }
    });
  }

  addClusteredSource(id: string, data: GeoJSON.FeatureCollection) {
    const map = this.map;
    this.#sources[id] = data;

    const existing = map.getSource(id);
    if (existing) {
      (existing as maplibregl.GeoJSONSource).setData(data);
      return;
    }

    map.addSource(id, {
      type: 'geojson',
      data,
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 15,
      clusterProperties: {
        cnt_available: ['+', ['get', 'cnt_available']],
        cnt_reserved: ['+', ['get', 'cnt_reserved']],
        cnt_rented: ['+', ['get', 'cnt_rented']],
      },
    });

    const onSourceData = () => {
      map.off('sourcedata', onSourceData);

      if (!map.getLayer(`${id}-clusters`)) {
        map.addLayer({
          id: `${id}-clusters`,
          type: 'symbol',
          source: id,
          filter: ['has', 'point_count'],
          layout: {
            'icon-image': [
              'concat',
              'cluster-',
              ['get', 'cnt_available'],
              '-',
              ['get', 'cnt_reserved'],
              '-',
              ['get', 'cnt_rented'],
            ],
            'icon-size': 1,
            'icon-allow-overlap': true,
          },
        });
      }

      if (!map.getLayer(`${id}-cluster-count`)) {
        map.addLayer({
          id: `${id}-cluster-count`,
          type: 'symbol',
          source: id,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12,
          },
          paint: { 'text-color': '#fff' },
        });
      }

      if (!map.getLayer(`${id}-unclustered-point`)) {
        map.addLayer({
          id: `${id}-unclustered-point`,
          type: 'symbol',
          source: id,
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': ['get', 'marker_type'],
            'icon-size': 0.1,
            'icon-allow-overlap': false,
          },
        });
      }
    };

    map.on('sourcedata', onSourceData);
  }

  async #addImages(icons: Record<string, string>) {
    try {
      for (const [key, src] of Object.entries(icons)) {
        const img = await this.map.loadImage(src);
        if (!this.map.hasImage(key)) this.map.addImage(key, img.data);
      }
    } catch {
    }
  }

  async #restoreSourcesAndLayers() {
    const map = this.map;
    if (!map) return;
    await this.#addImages(this.images());
    for (const [id, data] of Object.entries(this.#sources)) {
      this.addClusteredSource(id, data);
    }
  }
}
