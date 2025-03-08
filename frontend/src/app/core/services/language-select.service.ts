import { Injectable, signal, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ILanguageOption } from '@shared/interfaces';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class LanguageSelectService {
  private readonly translateService = inject(TranslateService);
  private readonly storageService = inject(StorageService);

  // Доступные языки
  public readonly availableLanguages = ['en', 'ru', 'es', 'pt'];

  // Сигнал для текущего языка
  private currentLangSignal = signal<string>(
    this.storageService.getItem('language') || this.translateService.getBrowserLang() || this.availableLanguages[0],
  );

  // Вычисляемый сигнал для языковых опций
  public languageOptions = computed<ILanguageOption[]>(() => [
    { value: 'en', label: this.translateService.instant('English') },
    { value: 'ru', label: this.translateService.instant('Русский') },
    { value: 'es', label: this.translateService.instant('Español') },
    { value: 'pt', label: this.translateService.instant('Português') },
  ]);

  // Вычисляемый сигнал для текущей опции
  public currentLanguageOption = computed<ILanguageOption>(() => {
    const options = this.languageOptions();
    return options.find(option => option.value === this.currentLangSignal()) || options[0];
  });

  constructor() {
    this.translateService.addLangs(this.availableLanguages);
    this.translateService.setDefaultLang(this.currentLangSignal());
    this.translateService.use(this.currentLangSignal());
  }

  // Смена языка
  public changeLanguage(value: string): void {
    this.currentLangSignal.set(value);
    this.storageService.setItem('language', value);
    this.translateService.use(value);
  }
}
