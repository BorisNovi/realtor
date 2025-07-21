import { Component, DestroyRef, effect, inject, input, linkedSignal, OnDestroy, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import maplibregl, { LngLatLike, Marker, Popup } from 'maplibre-gl';
import { TooltipModule } from 'primeng/tooltip';
import { MapComponent } from './map.component';
import { DEFAULT_MAP_MARKER } from './marker.svg';

@Component({
  selector: 'rx-map-marker',
  imports: [TooltipModule],
  template: '',
  styles: `
    ::ng-deep {
      .maplibregl-popup {
        &-content {
          padding: 5px;
          background: var(--p-button-secondary-background);
        }

        &-anchor {
          &-top-left .maplibregl-popup-tip,
          &-top-right .maplibregl-popup-tip,
          &-top .maplibregl-popup-tip {
            border-bottom-color: var(--p-button-secondary-background) !important;
          }
          &-bottom-left .maplibregl-popup-tip,
          &-bottom-right .maplibregl-popup-tip,
          &-bottom .maplibregl-popup-tip {
            border-top-color: var(--p-button-secondary-background) !important;
          }
          &-left .maplibregl-popup-tip {
            border-right-color: var(--p-button-secondary-background) !important;
          }
          &-right .maplibregl-popup-tip {
            border-left-color: var(--p-button-secondary-background) !important;
          }
        }
      }
    }
  `,
})
export class MapMarkerComponent implements OnInit, OnDestroy {
  readonly position = input.required<LngLatLike>();
  readonly svg = input<string>(DEFAULT_MAP_MARKER);
  readonly color = input<string>('var(--primary-color)');
  readonly draggable = input(false, { transform: v => v === '' || !!v });
  readonly clickable = input(false, { transform: v => v === '' || !!v });
  readonly titlePopup = input<string | { name: string; value: string }[] | null>(null);
  readonly popupBehavior = input<'click' | 'hover' | 'always'>('always');

  readonly markerClick = output<void>();
  readonly dragEnd = output<LngLatLike>();

  readonly #mapCmp = inject(MapComponent);
  readonly #destroyRef = inject(DestroyRef);

  readonly #pos = linkedSignal(() => this.position());
  readonly #map = signal<maplibregl.Map | null>(null);
  readonly #marker = signal<Marker | null>(null);
  readonly #popup = signal<Popup | null>(null);
  readonly #shouldShowPopup = signal(false);

  #element!: HTMLDivElement;
  #onClick!: () => void;
  #onEnter?: () => void;
  #onLeave?: () => void;
  #onToggle?: () => void;

  constructor() {
    effect(() => {
      const m = this.#marker();
      if (!m) return;
      m.setLngLat(this.#pos());
    });
    effect(() => {
      const m = this.#marker();
      if (!m) return;
      m.setDraggable(this.draggable());
    });
    effect(() => {
      const m = this.#marker();
      const c = this.clickable();
      const d = this.draggable();
      if (!m) return;

      this.#removeMarkerEvents();
      this.#setupMarkerEvents();

      if (c) this.#element.style.cursor = 'pointer';
      if (!c && d) this.#element.style.cursor = 'grab';
      if (!c && !d) this.#element.style.cursor = 'default';
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
    effect(() => {
      const position = this.#pos();
      const title = this.titlePopup();
      const show = this.#shouldShowPopup();
      if (!this.#map() && show) return;

      let popup = this.#popup();
      if (!popup) {
        popup = new maplibregl.Popup({
          offset: 20,
          closeButton: false,
          closeOnClick: false,
        });
        this.#popup.set(popup);
      }

      if (!popup) return;

      let content: Node;
      if (typeof title === 'string') {
        content = document.createTextNode(title);
      } else if (Array.isArray(title)) {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        for (const item of title) {
          const li = document.createElement('li');
          li.innerHTML = `<b>${item.name}:</b> ${item.value}`;
          ul.appendChild(li);
        }
        content = ul;
      } else {
        content = document.createTextNode('');
      }

      popup.setLngLat(position);
      popup.setDOMContent(content);

      if (show) popup.addTo(this.#map()!);
      else popup.remove();
    });
  }

  ngOnInit(): void {
    this.#mapCmp.mapReady$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(map => {
      this.#map.set(map);
      this.#createMarker(map);
    });
  }

  #createMarker(map: maplibregl.Map): void {
    this.#element = document.createElement('div');
    this.#element.innerHTML = this.svg();
    this.#element.style.display = 'flex';
    this.#element.style.alignItems = 'flex-end';
    this.#element.style.color = this.color();

    const marker = new maplibregl.Marker({ element: this.#element, draggable: this.draggable() })
      .setLngLat(this.#pos())
      .addTo(map);

    marker.on('dragstart', () => this.#shouldShowPopup.set(false));
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      this.dragEnd.emit([lngLat.lng, lngLat.lat]);
      this.#popup()?.setLngLat(lngLat);
      this.#pos.set(lngLat);
      this.#shouldShowPopup.set(true);
    });

    this.#marker.set(marker);
  }

  #setupMarkerEvents(): void {
    const el = this.#element;
    const c = this.clickable();

    if (!c) {
      this.#shouldShowPopup.set(this.popupBehavior() === 'always');
      return;
    }

    this.#onClick = () => this.markerClick.emit();
    el.addEventListener('click', this.#onClick);

    switch (this.popupBehavior()) {
      case 'click':
        this.#onToggle = () => this.#shouldShowPopup.set(!this.#shouldShowPopup());
        el.addEventListener('click', this.#onToggle);
        break;

      case 'hover':
        this.#onEnter = () => this.#shouldShowPopup.set(true);
        this.#onLeave = () => this.#shouldShowPopup.set(false);
        el.addEventListener('mouseenter', this.#onEnter);
        el.addEventListener('mouseleave', this.#onLeave);
        break;

      case 'always':
        this.#shouldShowPopup.set(true);
        break;
    }
  }

  #removeMarkerEvents(): void {
    const el = this.#element;
    if (!el) return;

    el?.removeEventListener('click', this.#onClick);
    if (this.#onToggle) el.removeEventListener('click', this.#onToggle);
    if (this.#onEnter) el.removeEventListener('mouseenter', this.#onEnter);
    if (this.#onLeave) el.removeEventListener('mouseleave', this.#onLeave);

    this.#onClick = undefined!;
    this.#onToggle = undefined;
    this.#onEnter = undefined;
    this.#onLeave = undefined;
  }

  ngOnDestroy(): void {
    this.#removeMarkerEvents();

    this.#marker()?.remove();
    this.#popup()?.remove();
  }
}
