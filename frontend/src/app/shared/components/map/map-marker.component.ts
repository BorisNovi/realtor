import { Component, DestroyRef, effect, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import maplibregl, { LngLatLike, Marker, Popup } from 'maplibre-gl';
import { TooltipModule } from 'primeng/tooltip';
import { MapComponent } from './map.component';
import { DEFAULT_MAP_MARKER } from './marker.svg';

@Component({
  selector: 'app-map-marker',
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
  readonly title = input<string | { name: string; value: string }[] | null>(null);
  readonly showTooltip = input(false, { transform: v => v === '' || !!v });

  readonly markerClick = output<void>();
  readonly dragEnd = output<LngLatLike>();

  readonly #mapCmp = inject(MapComponent);
  readonly #destroyRef = inject(DestroyRef);

  readonly #marker = signal<Marker | null>(null);
  readonly #popup = signal<Popup | null>(null);
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
    effect(() => {
      const m = this.#marker();
      const title = this.title();
      if (!m || !title) return;

      let popup = this.#popup();
      if (!popup) {
        popup = new maplibregl.Popup({
          offset: 20,
          closeButton: false,
          closeOnClick: false,
        });
        this.#popup.set(popup);
        m.setPopup(popup);
      }

      // Генерация DOM
      let content: Node;
      if (typeof title === 'string') {
        content = document.createTextNode(title);
      } else {
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
      }

      popup.setDOMContent(content);

      if (this.showTooltip()) popup.addTo(m._map);
      else popup.remove();
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
    this.#popup()?.remove();
  }
}
