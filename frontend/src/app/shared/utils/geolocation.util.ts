import { LngLatLike } from 'maplibre-gl';

export function getCurrentLocation(): Promise<LngLatLike> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation API unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve([coords.longitude, coords.latitude]);
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5_000,
      },
    );
  });
}
