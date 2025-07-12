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
  readonly scrollZoomDisabled = input(false, { transform: v => v === '' || !!v });

  readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
  readonly layoutService = inject(PrivateLayoutService);

  readonly #mapS = signal<maplibregl.Map | null>(null);
  readonly mapReady$ = new ReplaySubject<maplibregl.Map>(1);

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
  }

  get map(): maplibregl.Map {
    const m = this.#mapS();
    if (!m) throw new Error('Map is not ready yet');
    return m;
  }
}
