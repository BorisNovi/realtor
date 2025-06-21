import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GeocodeFeatureCollection } from '@shared/interfaces';
import { normalizeLngLat } from '@shared/utils';
import { LngLatLike } from 'maplibre-gl';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeocodeService {
  readonly #http = inject(HttpClient);
  readonly #cache = new Map<string, any>();

  geocode(query: string): Observable<GeocodeFeatureCollection> {
    if (this.#cache.has(query)) return of(this.#cache.get(query));

    const params = {
      q: query,
      format: 'geojson',
      addressdetails: 1,
      limit: 1,
      layer: 'address',
      // countrycodes: 'ge',
      // countrycodes // comma-separated list of country codes
      // street
      // city
      // county
      // state
      // country
      // postalcode
    };

    return this.#http
      .get<GeocodeFeatureCollection>('https://nominatim.openstreetmap.org/search', { params })
      .pipe(tap(result => this.#cache.set(query, result)));
  }

  reverse(position: LngLatLike): Observable<GeocodeFeatureCollection> {
    const { lng, lat } = normalizeLngLat(position);
    const cacheKey = `${lng},${lat}`;

    if (this.#cache.has(cacheKey)) return of(this.#cache.get(cacheKey));

    const params = {
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'geojson',
      addressdetails: 1,
    };

    return this.#http
      .get<GeocodeFeatureCollection>('https://nominatim.openstreetmap.org/reverse', { params })
      .pipe(tap(result => this.#cache.set(cacheKey, result)));
  }
}
