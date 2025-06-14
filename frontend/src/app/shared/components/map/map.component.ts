import { AfterViewInit, Component, effect, ElementRef, inject, input, signal } from '@angular/core';
import { environment } from '@environments/environment';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { ReplaySubject } from 'rxjs';
import { PrivateLayoutService } from 'src/app/layouts/private-layout/shared';

@Component({
  selector: 'app-map',
  imports: [],
  template: '<ng-content></ng-content>',
})
export class MapComponent implements AfterViewInit {
  readonly center = input<LngLatLike>([0, 0]);
  readonly zoom = input<number>(3);

  readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
  readonly layoutService = inject(PrivateLayoutService);

  readonly #mapS = signal<maplibregl.Map | null>(null);
  readonly mapReady$ = new ReplaySubject<maplibregl.Map>(1);

  constructor() {
    effect(() => {
      const center = this.center();
      if (this.#mapS()) this.map?.setCenter(center);
    });
    effect(() => {
      const map = this.#mapS();
      const z = this.zoom();
      if (map) map.setZoom(z);
    });
    effect(() => {
      const map = this.#mapS();
      const dt = this.layoutService.isDarkTheme();
      if (map) map.setStyle(dt ? environment.tilesDarkUrl : environment.tilesLightUrl);
    });
  }

  ngAfterViewInit(): void {
    const map = new maplibregl.Map({
      container: this.#host.nativeElement,
      // cooperativeGestures: true,
      style: environment.tilesDarkUrl,
      center: this.center(),
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
