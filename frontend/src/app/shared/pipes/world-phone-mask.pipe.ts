import { Pipe, PipeTransform } from '@angular/core';
import { PHONE_MASKS } from '@shared/constants';
import { IPhoneMaskConfig } from '@shared/interfaces';

@Pipe({
  name: 'worldPhoneMask',
  standalone: true,
  pure: true,
})
export class WorldPhoneMaskPipe implements PipeTransform {
  #countryConfigs: Record<string, IPhoneMaskConfig> = PHONE_MASKS;
  #countryCodes: string[] = Object.keys(this.#countryConfigs);

  transform(value: string | null | undefined, mode: 'formatted' | 'countryIso' = 'formatted'): string {
    if (!value) return '';

    const rawDigits = value.replace(/\D/g, '');
    const { countryCode, number } = this.#determineCountryCode(value, rawDigits);

    if (!countryCode) return mode === 'countryIso' ? '' : value;

    if (mode === 'countryIso') {
      return this.#countryConfigs[countryCode].countryIsoCode;
    }

    const limited = this.#limitLength(number, countryCode);
    return this.#formatNumber(countryCode, limited);
  }

  #determineCountryCode(original: string, digits: string): { countryCode: string | null; number: string } {
    for (const code of this.#countryCodes) {
      const bare = code.slice(1);
      if (original.startsWith(code) || digits.startsWith(bare)) {
        const number = digits.startsWith(bare) ? digits.slice(bare.length) : digits.slice(code.length - 1);
        return { countryCode: code, number };
      }
    }
    return { countryCode: null, number: digits };
  }

  #limitLength(number: string, code: string): string {
    const max = this.#countryConfigs[code].maxLength;
    return number.length > max ? number.slice(0, max) : number;
  }

  #formatNumber(code: string, number: string): string {
    const { formatGroups } = this.#countryConfigs[code];
    if (!formatGroups.length) return code + number;

    let result = code;
    let idx = 0;

    formatGroups.forEach((size, i) => {
      if (idx >= number.length) return;
      const part = number.slice(idx, idx + size);
      if (i === 0) result += ` (${part}`;
      else if (i === 1) result += `) ${part}`;
      else result += `-${part}`;
      idx += size;
    });

    return result;
  }
}
