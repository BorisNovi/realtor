import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LngLat } from 'maplibre-gl';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeocodeService {
  readonly #http = inject(HttpClient);
  readonly #cache = new Map<string, any>();

  geocode(query: string): Observable<any>;
  geocode(query: LngLat): Observable<any>;
  geocode(query: string | LngLat): Observable<any> {
    if (typeof query === 'string') {
      if (this.#cache.has(query)) return of(this.#cache.get(query));

      // TODO: сделать отдельный ввод города и опции
      const params = {
        q: query,
        format: 'geojson', // xml, json, jsonv2, geojson, geocodejson
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
        .get('https://nominatim.openstreetmap.org/search', { params })
        .pipe(tap(result => this.#cache.set(query, result)));
    }

    const cacheKey = `${query.lng},${query.lat}`;
    if (this.#cache.has(cacheKey)) return of(this.#cache.get(cacheKey));

    const params = {
      lat: query.lat.toString(),
      lon: query.lng.toString(),
      format: 'geojson',
      addressdetails: 1,
    };
    return this.#http
      .get('https://nominatim.openstreetmap.org/reverse', { params })
      .pipe(tap(result => this.#cache.set(cacheKey, result)));
  }
}
