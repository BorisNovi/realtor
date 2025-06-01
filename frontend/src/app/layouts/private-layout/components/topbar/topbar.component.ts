import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PrivateLayoutService } from '../../shared';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { LanguageSelectService } from 'src/app/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconDirective } from '@shared/directives';

@Component({
  selector: 'app-topbar',
  imports: [RouterModule, CommonModule, StyleClassModule, TranslatePipe, IconDirective],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  readonly #languageSelectService = inject(LanguageSelectService);
  readonly layoutService = inject(PrivateLayoutService);
  items!: MenuItem[];

  readonly currentLanguage = this.#languageSelectService.currentLanguageOption;

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
