import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectService } from 'src/app/core';
import { Carousel, CarouselModule } from 'primeng/carousel';

interface IAboutFeature {
  titleKey: string;
  descKeys: string[];
}
interface IFaqItem {
  questionKey: string;
  answerKey: string;
}

interface IFeature {
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'rx-landing',
  imports: [RouterLink, TranslateModule, CarouselModule],
  templateUrl: 'landing.component.html',
  styleUrl: 'landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  readonly #languageSelectService = inject(LanguageSelectService);

  readonly carousel = viewChild<Carousel>('aboutCarousel');

  readonly mobileMenuOpen = signal(false);
  readonly openFaqIndex = signal<number | null>(null);
  readonly currentLanguage = this.#languageSelectService.currentLanguageOption;

  readonly aboutFeatures: IAboutFeature[] = [
    {
      titleKey: 'LANDING.ABOUT.ITEM_1_TITLE',
      descKeys: ['LANDING.ABOUT.ITEM_1_1_DESC', 'LANDING.ABOUT.ITEM_1_2_DESC', 'LANDING.ABOUT.ITEM_1_3_DESC'],
    },
    {
      titleKey: 'LANDING.ABOUT.ITEM_2_TITLE',
      descKeys: ['LANDING.ABOUT.ITEM_2_1_DESC', 'LANDING.ABOUT.ITEM_2_2_DESC', 'LANDING.ABOUT.ITEM_2_3_DESC'],
    },
    {
      titleKey: 'LANDING.ABOUT.ITEM_3_TITLE',
      descKeys: ['LANDING.ABOUT.ITEM_3_1_DESC', 'LANDING.ABOUT.ITEM_3_2_DESC', 'LANDING.ABOUT.ITEM_3_3_DESC'],
    },
    {
      titleKey: 'LANDING.ABOUT.ITEM_4_TITLE',
      descKeys: ['LANDING.ABOUT.ITEM_4_1_DESC', 'LANDING.ABOUT.ITEM_4_2_DESC', 'LANDING.ABOUT.ITEM_4_3_DESC'],
    },
    {
      titleKey: 'LANDING.ABOUT.ITEM_5_TITLE',
      descKeys: ['LANDING.ABOUT.ITEM_5_1_DESC', 'LANDING.ABOUT.ITEM_5_2_DESC', 'LANDING.ABOUT.ITEM_5_3_DESC'],
    },
    {
      titleKey: 'LANDING.ABOUT.ITEM_6_TITLE',
      descKeys: ['LANDING.ABOUT.ITEM_6_1_DESC', 'LANDING.ABOUT.ITEM_6_2_DESC'],
    },
    {
      titleKey: 'LANDING.ABOUT.ITEM_7_TITLE',
      descKeys: ['LANDING.ABOUT.ITEM_7_1_DESC', 'LANDING.ABOUT.ITEM_7_2_DESC'],
    },
  ];

  readonly features: IFeature[] = [
    { titleKey: 'LANDING.FEATURES.ITEM_1_TITLE', descKey: 'LANDING.FEATURES.ITEM_1_DESC' },
    { titleKey: 'LANDING.FEATURES.ITEM_2_TITLE', descKey: 'LANDING.FEATURES.ITEM_2_DESC' },
    { titleKey: 'LANDING.FEATURES.ITEM_3_TITLE', descKey: 'LANDING.FEATURES.ITEM_3_DESC' },
    { titleKey: 'LANDING.FEATURES.ITEM_4_TITLE', descKey: 'LANDING.FEATURES.ITEM_4_DESC' },
    { titleKey: 'LANDING.FEATURES.ITEM_5_TITLE', descKey: 'LANDING.FEATURES.ITEM_5_DESC' },
    { titleKey: 'LANDING.FEATURES.ITEM_6_TITLE', descKey: 'LANDING.FEATURES.ITEM_6_DESC' },
  ];

  readonly faqItems: IFaqItem[] = [
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
