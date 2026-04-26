import { Currency } from '@shared/enums';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  // Европа
  EUR: '€',
  GBP: '£',
  CHF: 'Fr',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RSD: 'RSD',
  RUB: '₽',

  // Азия
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  KRW: '₩',
  SGD: '$',
  HKD: '$',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  IDR: 'Rp',

  // Северная Америка
  USD: '$',
  CAD: '$',
  MXN: '$',

  // Южная Америка
  BRL: 'R$',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  VES: 'Bs.',
  UYU: '$U',

  // Постсоветские страны
  GEL: '₾', // Грузинский лари
  AMD: '֏', // Армянский драм
  AZN: '₼', // Азербайджанский манат
  BYN: 'Br', // Белорусский рубль
  KZT: '₸', // Казахский тенге
  UAH: '₴', // Украинская гривна
  MDL: 'L', // Молдавский лей
  TJS: 'ЅМ', // Таджикский сомони
  TMT: 'm', // Туркменский манат
  UZS: "so'm", // Узбекский сум
  KGS: 'с', // Киргизский сом
};
