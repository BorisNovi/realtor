import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PrivateLayoutService } from '../../shared';
import { ButtonModule } from 'primeng/button';
import { LanguageSelectService } from 'src/app/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-configurator',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './configurator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorComponent {
  private readonly languageSelectService = inject(LanguageSelectService);
  public readonly layoutService = inject(PrivateLayoutService);

  public readonly currentLanguage = this.languageSelectService.currentLanguageOption;

  isDarkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);

  toggleDarkMode() {
    this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
  }

  toggleLanguage(): void {
    const availableLanguages = this.languageSelectService.availableLanguages;
    const currentLang = this.languageSelectService.currentLanguageOption().value;

    const currentIndex = availableLanguages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    const nextLang = availableLanguages[nextIndex];

    this.languageSelectService.changeLanguage(nextLang);
  }
}
