import { Component, DestroyRef, effect, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import maplibregl, { LngLatLike, Marker } from 'maplibre-gl';
import { MapComponent } from './map.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEFAULT_MAP_MARKER } from './marker.svg';

@Component({
  selector: 'app-map-marker',
  imports: [],
  template: '',
})
export class MapMarkerComponent implements OnInit, OnDestroy {
  readonly position = input.required<LngLatLike>();
  readonly svg = input<string>(DEFAULT_MAP_MARKER);
  readonly color = input<string>('var(--primary-color)');
  readonly draggable = input(false, { transform: v => v === '' || !!v });

  readonly markerClick = output<void>();
  readonly dragEnd = output<LngLatLike>();

  readonly #mapCmp = inject(MapComponent);
  readonly #destroyRef = inject(DestroyRef);

  readonly #marker = signal<Marker | null>(null);
  #element!: HTMLDivElement;
  #onClick!: () => void;

  constructor() {
    effect(() => {
      const m = this.#marker();
      if (!m) return;
      m.setLngLat(this.position());
    });
    effect(() => {
      const m = this.#marker();
      if (!m) return;
      m.setDraggable(this.draggable());
    });
    effect(() => {
      const m = this.#marker();
      const svg = this.svg();
      if (!m || !svg) return;
      const el = m.getElement();
      el.innerHTML = this.svg();
    });
    effect(() => {
      const m = this.#marker();
      const c = this.color();
      if (!m || !c) return;
      const el = m.getElement();
      el.style.color = c;
    });
  }

  ngOnInit(): void {
    this.#mapCmp.mapReady$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(map => {
      this.#createMarker(map);
    });
  }

  #createMarker(map: maplibregl.Map): void {
    this.#element = document.createElement('div');
    this.#element.innerHTML = this.svg();
    this.#element.style.display = 'flex';
    this.#element.style.alignItems = 'flex-end';
    this.#element.style.color = this.color();

    this.#onClick = () => this.markerClick.emit();
    this.#element.addEventListener('click', this.#onClick);

    const marker = new maplibregl.Marker({ element: this.#element, draggable: this.draggable() })
      .setLngLat(this.position())
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      this.dragEnd.emit([lngLat.lng, lngLat.lat]);
    });

    this.#marker.set(marker);
  }

  ngOnDestroy(): void {
    this.#element?.removeEventListener('click', this.#onClick);
    this.#marker()?.remove();
  }
}
