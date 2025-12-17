import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, signal } from '@angular/core';
import { environment } from '@environments/environment';
import maplibregl, { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
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
      clusterRadius: 20,
      clusterMaxZoom: 15,
    });

    const onSourceData = () => {
      map.off('sourcedata', onSourceData);

      if (!map.getLayer(`${id}-clusters`)) {
        map.addLayer({
          id: `${id}-clusters`,
          type: 'circle',
          source: id,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#4D82F0',
            'circle-stroke-color': '#4D82F0',
            'circle-stroke-width': 5,
            'circle-stroke-opacity': 0.7,
            'circle-radius': ['step', ['get', 'point_count'], 18, 20, 24, 50, 30],
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
        this.map.addImage(key, img.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  #restoreSourcesAndLayers() {
    const map = this.map;
    if (!map) return;
    for (const [id, data] of Object.entries(this.#sources)) {
      this.addClusteredSource(id, data);
    }
  }
}
