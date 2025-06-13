import { Directive, ElementRef, forwardRef, HostListener, inject, output } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { PHONE_MASKS } from '@shared/constants';
import { IPhoneMaskConfig } from '@shared/interfaces';

@Directive({
  selector: '[appWorldPhoneMasks]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WorldPhoneMasksDirective),
      multi: true,
    },
  ],
})
export class WorldPhoneMasksDirective implements ControlValueAccessor {
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const { formattedValue, isValid } = this.#addPhoneMask(value);

    input.value = formattedValue;
    this.#onChange(formattedValue);
    this.valid.emit(isValid);
  }

  @HostListener('blur')
  onBlur(): void {
    this.#onTouched();
  }

  readonly countryIsoCode = output<string>();
  readonly valid = output<boolean>();

  #elementRef = inject(ElementRef);

  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  #determinedCountryCode: string | null = null;
  #countryConfigs: Record<string, IPhoneMaskConfig> = PHONE_MASKS;
  #countryCodes: string[] = Object.keys(this.#countryConfigs);

  #addPhoneMask(phone: string): { formattedValue: string; isValid: boolean } {
    const original = phone;
    const digits = this.#cleanInput(phone);
    const { countryCode, number } = this.#determineCountryCode(original, digits);
    const limitedNumber = this.#limitNumberLength(number, countryCode);
    const formattedValue = this.#formatNumber(countryCode, limitedNumber);

    const isValid = countryCode ? limitedNumber.length === this.#countryConfigs[countryCode].maxLength : false;

    return { formattedValue, isValid };
  }

  #cleanInput(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  #determineCountryCode(original: string, phone: string): { countryCode: string | null; number: string } {
    let countryCode = this.#determinedCountryCode;
    let number = phone;

    if (this.#determinedCountryCode && original.length <= this.#determinedCountryCode.length) {
      this.#determinedCountryCode = null;
      countryCode = null;
    }

    if (!countryCode) {
      if (phone.startsWith('8') && phone.length >= 1) {
        // Защита от вставки номера с 8 в начале (RU)
        countryCode = '+7';
        this.#determinedCountryCode = '+7';
        number = phone.slice(1);

        this.countryIsoCode.emit(this.#countryConfigs['7'].countryIsoCode);
      } else {
        for (const code of this.#countryCodes) {
          const codeWithoutPlus = code.replace('+', '');
          const minLength = codeWithoutPlus.length; // Минимальная длина = длина кода без '+'
          if (original.startsWith(code) || (phone.startsWith(codeWithoutPlus) && phone.length >= minLength)) {
            countryCode = code;
            this.#determinedCountryCode = code;
            number = phone.startsWith(codeWithoutPlus) ? phone.slice(codeWithoutPlus.length) : phone.slice(code.length);

            this.countryIsoCode.emit(this.#countryConfigs[code].countryIsoCode);
            break;
          }
        }
      }

      if (!countryCode) {
        return { countryCode: null, number: original.startsWith('+') ? '+' + phone : phone };
      }
    } else {
      number = phone.startsWith(countryCode.replace('+', '')) ? phone.slice(countryCode.replace('+', '').length) : phone;
    }

    return { countryCode, number };
  }

  #limitNumberLength(number: string, countryCode: string | null): string {
    const maxLength = countryCode && this.#countryConfigs[countryCode] ? this.#countryConfigs[countryCode].maxLength : 12;
    return number.length > maxLength ? number.slice(0, maxLength) : number;
  }

  #formatNumber(countryCode: string | null, number: string): string {
    if (!countryCode || !this.#countryConfigs[countryCode]) {
      return number;
    }

    const config = this.#countryConfigs[countryCode];
    if (config.formatGroups.length === 0) {
      return countryCode + number; // Без форматирования, просто код + номер
    }

    return this.#formatPhoneNumber(countryCode, number, config.formatGroups);
  }

  #formatPhoneNumber(countryCode: string, number: string, groups: number[]): string {
    let formatted = countryCode;
    let startIndex = 0;

    for (let i = 0; i < groups.length; i++) {
      const groupSize = groups[i];
      const endIndex = startIndex + groupSize;

      if (number.length > startIndex) {
        const group = number.slice(startIndex, endIndex);
        if (i === 0) {
          formatted += ' (' + group; // Первая группа в скобках
        } else if (i === 1) {
          formatted += ') ' + group; // После первой группы закрываем скобки
        } else {
          formatted += '-' + group; // Остальные группы через дефис
        }
        startIndex = endIndex;
      }
    }

    return formatted;
  }

  // Реализация ControlValueAccessor
  writeValue(value: string): void {
    if (value) {
      const { formattedValue, isValid } = this.#addPhoneMask(value);
      this.#elementRef.nativeElement.value = formattedValue;
      this.valid.emit(isValid);
    } else {
      this.#elementRef.nativeElement.value = '+';
      this.valid.emit(false);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.#elementRef.nativeElement.disabled = isDisabled;
  }
}
