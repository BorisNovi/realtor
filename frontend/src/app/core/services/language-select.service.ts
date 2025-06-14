import { Injectable, signal, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ILanguageOption } from '@shared/interfaces';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class LanguageSelectService {
  readonly #translateService = inject(TranslateService);
  readonly #storageService = inject(StorageService);

  // Доступные языки
  readonly availableLanguages = ['en', 'ru', 'es', 'pt'];

  // Сигнал для текущего языка
  readonly #currentLangSignal = signal<string>(
    this.#storageService.getItem('language') || this.#translateService.getBrowserLang() || this.availableLanguages[0],
  );

  // Вычисляемый сигнал для языковых опций
  readonly languageOptions = computed<ILanguageOption[]>(() => [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'es', label: 'Español' },
    { value: 'pt', label: 'Português' },
  ]);

  // Вычисляемый сигнал для текущей опции
  readonly currentLanguageOption = computed<ILanguageOption>(() => {
    const options = this.languageOptions();
    return options.find(option => option.value === this.#currentLangSignal()) || options[0];
  });

  constructor() {
    this.#translateService.addLangs(this.availableLanguages);
    this.#translateService.setDefaultLang(this.#currentLangSignal());
    this.#translateService.use(this.#currentLangSignal());
  }

  // Смена языка
  changeLanguage(value: string): void {
    this.#currentLangSignal.set(value);
    this.#storageService.setItem('language', value);
    this.#translateService.use(value);
  }
}
