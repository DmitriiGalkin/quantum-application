export interface PageMeta {
  title: string;
  description: string;
  // Заголовок страницы при шаринге (до 60 символов)
  ogTitle: string;
  // Краткое описание под заголовком (1–2 строки текста)
  ogDescription: string;
  // Картинка превью (рекомендации: JPG / PNG, 1200×630 px, абсолютный URL)
  ogImage: string;
  // Тип контента
  ogType: string;
  // Название сайта/бренда (Показывается мелким текстом. Не всегда отображается во всех платформах)
  ogSiteName?: string;
}
