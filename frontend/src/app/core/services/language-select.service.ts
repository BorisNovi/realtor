import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ILanguageOption } from '@shared/interfaces';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class LanguageSelectService {
  readonly #translateService = inject(TranslateService);
  readonly #storageService = inject(StorageService);

  readonly availableLanguages = ['en', 'ru']; // es, pt
  readonly #defaultLanguage = 'en';

  readonly #currentLangSignal = signal<string>(this.#getInitialLanguage());

  #getInitialLanguage(): string {
    const savedLanguage = this.#storageService.getItem<string>('language');
    const browserLang = this.#translateService.getBrowserLang();

    if (savedLanguage && this.availableLanguages.includes(savedLanguage))
      return savedLanguage;
    if (browserLang && this.availableLanguages.includes(browserLang))
      return browserLang;
    return this.#defaultLanguage;
  }

  readonly languageOptions = computed<ILanguageOption[]>(() => [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    // { value: 'es', label: 'Español' },
    // { value: 'pt', label: 'Português' },
  ]);

  readonly currentLanguageOption = computed<ILanguageOption>(() => {
    const options = this.languageOptions();
    return options.find(option => option.value === this.#currentLangSignal()) || options[0];
  });

  constructor() {
    this.#translateService.addLangs(this.availableLanguages);
    this.#translateService.setDefaultLang(this.#currentLangSignal());
    this.#translateService.use(this.#currentLangSignal());
  }

  changeLanguage(value: string): void {
    this.#currentLangSignal.set(value);
    this.#storageService.setItem('language', value);
    this.#translateService.use(value);
  }
}
