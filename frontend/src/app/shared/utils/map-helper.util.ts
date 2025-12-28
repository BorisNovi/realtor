import { IMapBox } from '@shared/interfaces';
import { LngLat, LngLatLike } from 'maplibre-gl';

export class MapHelper {
  static readonly ZOOM_COUNTRY = 5;
  static readonly ZOOM_CITY = 7;
  static readonly ZOOM_DISTRICT = 12;
  static readonly ZOOM_STREET = 15;

  static normalizeLngLat(position: LngLatLike): { lng: number; lat: number } {
    if (position instanceof LngLat) {
      return { lng: position?.lng, lat: position?.lat };
    }
    if (Array.isArray(position)) {
      return { lng: position[0], lat: position[1] };
    }
    const lng = 'lng' in position ? position?.lng : position?.lon;
    return { lng, lat: position?.lat };
  }

  static expandBox(box: IMapBox, factor = 0.25): IMapBox {
    const width = box.maxLng - box.minLng;
    const height = box.maxLat - box.minLat;

    return {
      minLng: box.minLng - width * factor,
      maxLng: box.maxLng + width * factor,
      minLat: box.minLat - height * factor,
      maxLat: box.maxLat + height * factor,
    };
  }

  static isInsideBox(inner: IMapBox, outer: IMapBox): boolean {
    return (
      inner.minLng >= outer.minLng &&
      inner.maxLng <= outer.maxLng &&
      inner.minLat >= outer.minLat &&
      inner.maxLat <= outer.maxLat
    );
  }
}
