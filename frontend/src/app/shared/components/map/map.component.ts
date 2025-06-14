import { AfterViewInit, Component, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import maplibregl, { LngLatLike } from 'maplibre-gl';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
})
export class MapComponent implements AfterViewInit {
  readonly center = input<LngLatLike>([0, 0]);
  readonly zoom = input<number>(3);
  readonly mapContainer = viewChild.required<ElementRef>('map');
  readonly #mapS = signal<maplibregl.Map | null>(null);

  constructor() {
    effect(() => {
      const center = this.center();
      if (this.#mapS()) this.map?.setCenter(center);
    });
  }

  ngAfterViewInit(): void {
    const map = new maplibregl.Map({
      container: this.mapContainer().nativeElement, // container id
      // cooperativeGestures: true,
      style: 'https://demotiles.maplibre.org/style.json', // style URL
      center: this.center(), // starting position [lng, lat]
      zoom: 3,
    });

    this.#mapS.set(map);
  }

  get map(): maplibregl.Map {
    const m = this.#mapS();
    if (!m) throw new Error('Map is not ready yet');
    return m;
  }
}
