import { LngLat, LngLatLike } from 'maplibre-gl';

export function normalizeLngLat(position: LngLatLike): { lng: number; lat: number } {
  if (position instanceof LngLat) {
    return { lng: position?.lng, lat: position?.lat };
  }
  if (Array.isArray(position)) {
    return { lng: position[0], lat: position[1] };
  }
  const lng = 'lng' in position ? position?.lng : position?.lon;
  return { lng, lat: position?.lat };
}
