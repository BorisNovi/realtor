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
      queryParams = this.#flattenAndCleanParams(currentParams);
    } else {
      queryParams = this.#flattenAndCleanParams(params);
    }

    this.#router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
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
   * Synchronously retrieves current query parameters from the URL snapshot as a structured object.
   * Suitable for one-time initialization during app startup.
   * @returns Nested object representing the query parameters
   */
  getQueryParamsSync(): Record<string, any> {
    return this.#unflattenParams(this.#route.snapshot.queryParams);
  }

  /**
   * Synchronously retrieves a subset of query parameters for a specific key from the current snapshot.
   * Suitable for one-time initialization during app startup.
   * @param key The key to extract (e.g., 'filters', 'pagination')
   * @returns Nested object for the specified key
   */
  getQueryParamsByKeySync(key: string): any {
    return this.getQueryParamsSync()[key] || {};
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
   * Flattens nested parameter object, sets non-null/undefined values, and marks null/undefined values for removal.
   * @param params Object to flatten
   * @returns Flattened object with non-null/undefined values and null for parameters to remove
   */
  #flattenAndCleanParams(params: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    const flatten = (obj: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          result[newKey] = null; // Mark parameter for removal
          continue;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            result[newKey] = value.join(','); // Convert array to comma-separated string
          } else {
            result[newKey] = null; // Mark empty array for removal
          }
          continue;
        }

        if (typeof value === 'object' && !(value instanceof Date)) {
          flatten(value, newKey); // Recursively flatten nested objects
        } else {
          result[newKey] = value instanceof Date ? value.toISOString() : value; // Convert Date to ISO string
        }
      }
    };

    flatten(params);
    return result;
  }

  /**
   * Transforms flat query parameters into a nested object structure.
   * Converts comma-separated strings to arrays and ISO strings to Dates where applicable.
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

      // Split key into parts (e.g., 'filters.status' -> ['filters', 'status'])
      const keys = key.split('.');
      let current = result;

      // Build nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        current[k] = current[k] || {};
        current = current[k];
      }

      const finalKey = keys[keys.length - 1];
      let finalValue: any = value;

      // Handle arrays (e.g., 'flat,house' -> ['flat', 'house'])
      if (typeof value === 'string' && value.includes(',')) {
        finalValue = value.split(',').filter(v => v);
      }
      // if (typeof value === 'string') {
      //   const items = value.split(',').filter(v => v);
      //   if (items.length > 0) {
      //     finalValue = items;
      //   }
      // }

      // Handle dates (e.g., '2023-01-01T00:00:00.000Z' -> Date)
      if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          finalValue = date;
        }
      }

      current[finalKey] = finalValue;
    }

    return result;
  }
}
