export interface IPhotoItem {
  url?: string; // Для существующих фотографий (ссылка с бэкенда)
  file?: { name: string; content: string }; // Для новых фотографий
  isExisting: boolean; // Флаг, указывающий, с сервера ли фотография
}
