import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectService } from 'src/app/core';

interface FaqItem {
  questionKey: string;
  answerKey: string;
}

interface Feature {
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'rx-landing',
  imports: [RouterLink, TranslateModule],
  templateUrl: 'landing.component.html',
  styleUrl: 'landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  readonly #languageSelectService = inject(LanguageSelectService);

  readonly mobileMenuOpen = signal(false);
  readonly openFaqIndex = signal<number | null>(null);
  readonly currentLanguage = this.#languageSelectService.currentLanguageOption;

  readonly features: Feature[] = [
    { titleKey: 'LANDING.FEATURES.ITEM_1_TITLE', descKey: 'LANDING.FEATURES.ITEM_1_DESC' },
    { titleKey: 'LANDING.FEATURES.ITEM_2_TITLE', descKey: 'LANDING.FEATURES.ITEM_2_DESC' },
    { titleKey: 'LANDING.FEATURES.ITEM_3_TITLE', descKey: 'LANDING.FEATURES.ITEM_3_DESC' },
  ];

  readonly faqItems: FaqItem[] = [
    { questionKey: 'LANDING.FAQ.Q1', answerKey: 'LANDING.FAQ.A1' },
    { questionKey: 'LANDING.FAQ.Q2', answerKey: 'LANDING.FAQ.A2' },
    { questionKey: 'LANDING.FAQ.Q3', answerKey: 'LANDING.FAQ.A3' },
  ];

  toggleFaq(index: number): void {
    this.openFaqIndex.set(this.openFaqIndex() === index ? null : index);
  }

  toggleLanguage(): void {
    const langs = this.#languageSelectService.availableLanguages;
    const current = this.#languageSelectService.currentLanguageOption().value;
    const next = langs[(langs.indexOf(current) + 1) % langs.length];
    this.#languageSelectService.changeLanguage(next);
  }
}
