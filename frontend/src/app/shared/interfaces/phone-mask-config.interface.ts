export interface IPhoneMaskConfig {
  maxLength: number; // Максимальная длина номера без кода страны
  formatGroups: number[]; // Массив групп цифр для форматирования
  countryIsoCode: string; // Код страны ISO 3166-1 alpha-2
}
