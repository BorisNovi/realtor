/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QueryParamsService {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  /**
   * Updates query parameters in the URL based on the provided parameters.
   * If a key is specified, updates only the parameters under that key (e.g., 'filters', 'pagination').
   * Sets parameters for non-null/undefined values and removes parameters for null/undefined values.
   * Suitable for filters, pagination, theme, language, or other query parameters.
   * @param params Object containing parameter values
   * @param key Optional key to update specific parameters (e.g., 'filters', 'pagination')
   */
  updateQueryParams(params: Record<string, any>, key?: string): void {
    let queryParams: Record<string, any>;

    if (key) {
      const currentParams = this.#unflattenParams(this.#route.snapshot.queryParams);
      currentParams[key] = { ...currentParams[key], ...params };
      queryParams = this.buildQueryParams(currentParams);
    } else {
      queryParams = this.buildQueryParams(params);
    }

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  }

  /**
   * Retrieves current query parameters from the URL as a structured object.
   * Suitable for initializing filters, pagination, theme, language, or other settings.
   * @returns Observable of the query parameters as a nested object
   */
  getQueryParams(): Observable<Record<string, any>> {
    return this.#route.queryParams.pipe(map(params => this.#unflattenParams(params)));
  }

  /**
   * Retrieves a subset of query parameters for a specific key (e.g., 'filters', 'pagination').
   * @param key The key to extract (e.g., 'filters', 'pagination')
   * @returns Observable containing the parameters for the specified key
   */
  getQueryParamsByKey(key: string): Observable<any> {
    return this.getQueryParams().pipe(map(params => params[key] || {}));
  }

  /**
   * Synchronously parses query parameters from a provided query params object (e.g., from ActivatedRouteSnapshot).
   * Suitable for use in resolvers to extract query parameters before the route is fully activated.
   * @param queryParams Flat query parameters object (e.g., route.queryParams)
   * @param key Optional key to extract specific parameters (e.g., 'filters', 'pagination')
   * @returns Nested object for the specified key or entire params if no key provided
   */
  parseQueryParams(queryParams: Record<string, string | string[]>, key?: string): any {
    const parsedParams = this.#unflattenParams(queryParams);
    return key ? parsedParams[key] || {} : parsedParams;
  }

  /**
   * Flattens a nested object into a flat key-value map with dot notation.
   * Converts arrays to comma-separated strings with '[]' suffix, Dates to ISO strings, and marks null/undefined as null.
   * @param obj Object to flatten
   * @param prefix Optional key prefix (default: '')
   * @returns Flattened object with string values or null
   */
  buildQueryParams(obj: any, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};

    const appendParams = (obj: any, currentPrefix: string): void => {
      Object.entries(obj).forEach(([key, value]) => {
        // Add suffix '[]' for arrays
        const isArray = Array.isArray(value);
        const paramKey = currentPrefix ? `${currentPrefix}.${key}${isArray ? '[]' : ''}` : `${key}${isArray ? '[]' : ''}`;

        if (value === null || value === undefined) {
          result[paramKey] = null;
          return;
        }

        if (isArray) {
          if (value.length > 0) {
            // For arrays of objects use JSON.stringify
            const isObjectArray = value.every(item => typeof item === 'object' && item !== null && !(item instanceof Date));
            result[paramKey] = isObjectArray ? JSON.stringify(value) : value.map(item => String(item)).join(',');
          } else {
            result[paramKey] = null;
          }
          return;
        }

        if (typeof value === 'object' && !(value instanceof Date)) {
          appendParams(value, paramKey);
        } else {
          const paramValue = value instanceof Date ? value.toISOString() : String(value);
          result[paramKey] = paramValue;
        }
      });
    };

    appendParams(obj, prefix);
    return result;
  }

  /**
   * Transforms flat query parameters into a nested object structure.
   * Converts comma-separated strings to arrays for keys marked as arrays (e.g., ending with '[]') and ISO strings to Dates.
   * Attempts to parse JSON strings for arrays of objects.
   * @param flatParams Flat query parameters from URL
   * @returns Nested object representing the query parameters
   */
  #unflattenParams(flatParams: Record<string, string | string[]>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(flatParams)) {
      // Skip null or undefined values
      if (value === null || value === undefined) {
        continue;
      }

      // Split key into parts, handling array notation (e.g., 'filters.types[]' -> ['filters', 'types'])
      const keys = key.replace(/\[\]$/, '').split('.'); // Удаляем '[]' если есть
      let current = result;

      // Build nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        current[k] = current[k] || {};
        current = current[k];
      }

      const finalKey = keys[keys.length - 1];
      let finalValue: any = value;

      // Check if the key indicates an array (e.g., ends with '[]' in original key)
      const isArrayKey = key.endsWith('[]');

      if (isArrayKey && typeof value === 'string') {
        // Handle arrays (e.g., 'flat,house' -> ['flat', 'house'])
        if (value.includes(',')) {
          finalValue = value.split(',').filter(v => v);
        } else {
          // Single value for array key (e.g., 'flat' -> ['flat'])
          finalValue = [value];
        }
      } else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        // Try to parse JSON array of objects (e.g., '[{"id":1},{"id":2}]')
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            finalValue = parsed;
          }
        } catch (e) {
          // If JSON parsing fails, keep as string
          console.error('JSON parsing failed!', e);
          finalValue = value;
        }
      } else if (value === 'true') {
        finalValue = true;
      } else if (value === 'false') {
        finalValue = false;
      } else if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z/.test(value)) {
        // Handle dates (e.g., '2023-01-01T00:00:00.000Z' -> Date)
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          finalValue = date;
        }
      }

      // For array keys, ensure the value is always an array
      if (isArrayKey && !Array.isArray(finalValue)) {
        finalValue = [finalValue];
      }

      current[finalKey] = finalValue;
    }

    return result;
  }
}
