import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GeocodeFeatureCollection } from '@shared/interfaces';
import { normalizeLngLat } from '@shared/utils';
import { LngLatLike } from 'maplibre-gl';
import { Observable, of, tap } from 'rxjs';
import { LanguageSelectService } from './language-select.service';

@Injectable({ providedIn: 'root' })
export class GeocodeService {
  readonly #http = inject(HttpClient);
  readonly #languageSelectService = inject(LanguageSelectService);
  readonly #cache = new Map<string, any>();

  readonly currentLanguage = this.#languageSelectService.currentLanguageOption;

  geocode(query: string): Observable<GeocodeFeatureCollection> {
    if (this.#cache.has(query)) return of(this.#cache.get(query));

    const params = {
      q: query,
      format: 'geojson',
      addressdetails: 1,
      limit: 1,
      layer: 'address',
      'accept-language': `${this.currentLanguage().value}, en`,
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
      'accept-language': `${this.currentLanguage().value}, en`,
    };

    return this.#http
      .get<GeocodeFeatureCollection>('https://nominatim.openstreetmap.org/reverse', { params })
      .pipe(tap(result => this.#cache.set(cacheKey, result)));
  }
}
