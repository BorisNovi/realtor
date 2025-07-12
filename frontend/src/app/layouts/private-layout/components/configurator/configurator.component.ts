import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { LanguageSelectService } from 'src/app/core';
import { PrivateLayoutService } from '../../shared';

@Component({
  selector: 'rx-configurator',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './configurator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorComponent {
  readonly #languageSelectService = inject(LanguageSelectService);
  readonly layoutService = inject(PrivateLayoutService);

  readonly currentLanguage = this.#languageSelectService.currentLanguageOption;

  isDarkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);

  toggleDarkMode() {
    this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
  }

  toggleLanguage(): void {
    const availableLanguages = this.#languageSelectService.availableLanguages;
    const currentLang = this.#languageSelectService.currentLanguageOption().value;

    const currentIndex = availableLanguages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    const nextLang = availableLanguages[nextIndex];

    this.#languageSelectService.changeLanguage(nextLang);
  }
}
