import { Injectable } from '@angular/core';
import { load, GetResult } from '@fingerprintjs/fingerprintjs';
import { IFingerprintData } from '@shared/interfaces';
import { from, map, Observable, switchMap } from 'rxjs';

const getComponentValue = <T>(component: { duration: number; value?: T; error?: unknown } | undefined): T | undefined => {
  return component && 'value' in component ? component.value : undefined;
};

const getScreenResolution = (
  component: { duration: number; value?: unknown; error?: unknown } | undefined,
): [number, number] | undefined => {
  const value = getComponentValue<unknown>(component);
  if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
    return value as [number, number];
  }
  return undefined;
};

@Injectable({ providedIn: 'root' })
export class FingerprintService {
  getFingerprint(): Observable<IFingerprintData> {
    return from(load()).pipe(
      switchMap(fp => from(fp.get())),
      map((result: GetResult) => ({
        visitorId: result.visitorId,
        components: {
          dateTimeLocale: getComponentValue<string | -1 | -2 | -3>(result.components.dateTimeLocale),
          platform: getComponentValue<string>(result.components.platform),
          screenResolution: getScreenResolution(result.components.screenResolution),
          timezone: getComponentValue<string>(result.components.timezone),
        },
      })),
    );
  }
}
