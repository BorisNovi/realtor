import { IPhoneMaskConfig } from '@shared/interfaces';

// Конфигурационный объект: телефонный код страны -> { длина, форматирование, ISO код страны }
export const PHONE_MASKS: Record<string, IPhoneMaskConfig> = {
  '+1': { maxLength: 10, formatGroups: [3, 3, 4], countryIsoCode: 'US' }, // США: +X(XXX)XXX-XXXX
  '+7': { maxLength: 10, formatGroups: [3, 3, 2, 2], countryIsoCode: 'RU' }, // Россия: +X(XXX)XXX-XX-XX
  '+90': { maxLength: 10, formatGroups: [3, 3, 2, 2], countryIsoCode: 'TR' }, // Турция: +XX(XXX)XXX-XX-XX
  '+98': { maxLength: 10, formatGroups: [3, 3, 2, 2], countryIsoCode: 'IR' }, // Иран: +XX(XXX)XXX-XX-XX
  '+357': { maxLength: 8, formatGroups: [2, 2, 2, 2], countryIsoCode: 'CY' }, // Кипр: +XXX(XX)XX-XX-XX
  '+374': { maxLength: 8, formatGroups: [2, 2, 2, 2], countryIsoCode: 'AM' }, // Армения: +XXX(XX)XX-XX-XX
  '+375': { maxLength: 9, formatGroups: [2, 3, 2, 2], countryIsoCode: 'BY' }, // Беларусь: +XXX(XX)XXX-XX-XX
  '+380': { maxLength: 9, formatGroups: [2, 3, 2, 2], countryIsoCode: 'UA' }, // Украина: +XXX(XX)XXX-XX-XX
  '+971': { maxLength: 9, formatGroups: [2, 3, 2, 2], countryIsoCode: 'AE' }, // ОАЭ: +XXX(XX)XXX-XX-XX
  '+972': { maxLength: 9, formatGroups: [2, 3, 4], countryIsoCode: 'IL' }, // Израиль: +XXX(XX)XX-XXXX
  '+992': { maxLength: 9, formatGroups: [2, 3, 2, 2], countryIsoCode: 'TJ' }, // Таджикистан: +XXX(XX)XXX-XX-XX
  '+994': { maxLength: 9, formatGroups: [2, 3, 2, 2], countryIsoCode: 'AZ' }, // Азербайджан: +XXX(XX)XXX-XX-XX
  '+995': { maxLength: 9, formatGroups: [3, 2, 2, 2], countryIsoCode: 'GE' }, // Грузия: +XXX(XXX)XX-XX-XX
  '+996': { maxLength: 9, formatGroups: [3, 3, 3], countryIsoCode: 'KG' }, // Кыргызстан: +XXX(XXX)XXX-XXX
  '+998': { maxLength: 9, formatGroups: [2, 3, 4], countryIsoCode: 'UZ' }, // Узбекистан: +XXX(XX)XXX-XXXX
};
