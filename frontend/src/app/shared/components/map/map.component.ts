import { AfterViewInit, Component, effect, ElementRef, inject, input, signal } from '@angular/core';
import { environment } from '@environments/environment';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-map',
  imports: [],
  template: '<ng-content></ng-content>',
})
export class MapComponent implements AfterViewInit {
  readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly center = input<LngLatLike>([0, 0]);
  readonly zoom = input<number>(3);
  readonly #mapS = signal<maplibregl.Map | null>(null);
  readonly mapReady$ = new ReplaySubject<maplibregl.Map>(1);

  constructor() {
    effect(() => {
      const center = this.center();
      if (this.#mapS()) this.map?.setCenter(center);
    });
  }

  ngAfterViewInit(): void {
    const map = new maplibregl.Map({
      container: this.#host.nativeElement,
      // cooperativeGestures: true,
      style: environment.tilesUrl,
      center: this.center(),
      zoom: 3,
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
