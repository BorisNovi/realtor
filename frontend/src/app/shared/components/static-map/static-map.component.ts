import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { environment } from '@environments/environment';
import { LngLatLike } from 'maplibre-gl';

@Component({
  selector: 'rx-static-map',
  templateUrl: 'static-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaticMapComponent {
  readonly coordinates = input<LngLatLike | undefined>(undefined);
  readonly zoom = input<number>(16);

  readonly mapUrl = computed(() => {
    const coords = this.coordinates();
    if (!coords) return null;

    const [lng, lat] = this.#toLngLat(coords);
    const center = `lonlat:${lng},${lat}`;
    const marker = `lonlat:${lng},${lat};type:material;color:%2334d399`;

    return `${environment.staticMapUrl}&width=1080&height=630&center=${center}&zoom=${this.zoom()}&marker=${marker}`;
  });

  #toLngLat(position: LngLatLike): [number, number] {
    if (Array.isArray(position)) return [position[0], position[1]];
    if ('lng' in position) return [position.lng, position.lat];
    return [(position as { lon: number; lat: number }).lon, position.lat];
  }
}
