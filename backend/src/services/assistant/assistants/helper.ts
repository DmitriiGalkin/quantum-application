/**
 * Ищет и возвращает первый валидный JSON-объект или массив в строке.
 * @param {string} text - Строка, в которой нужно найти JSON.
 * @returns {any|null} - Распарсенный объект/значение или null, если JSON не найден или некорректен.
 */
export function extractJsonFromString(text: string): any | null {
  if (typeof text !== 'string') {
    console.error('Входное значение должно быть строкой.');
    return null;
  }

  // Регулярное выражение для поиска текста в фигурных или квадратных скобках.
  // Флаг 's' (dotAll) позволяет точке . захватывать переносы строк.
  const jsonRegex = /($$.*$$|\{.*\})/s;

  // Ищем совпадение в строке
  const match = text.match(jsonRegex);

  if (!match) {
    console.log('JSON-объект или массив не найден.');
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch (error) {
    console.error('Ошибка парсинга JSON:', (error as any).message);
    return null;
  }
}

/**
 * Ищет и возвращает первый валидный JSON-объект или массив в строке.
 * @param {string} text - Строка, в которой нужно найти JSON.
 * @returns {any|null} - Распарсенный объект/значение или null, если JSON не найден или некорректен.
 */
export function extractJsonFromString2(text: string): any | null {
  if (typeof text !== 'string') {
    console.error('Входное значение должно быть строкой.');
    return null;
  }

  // Регулярное выражение для поиска текста в фигурных или квадратных скобках.
  // Флаг 's' (dotAll) позволяет точке . захватывать переносы строк.
  const jsonRegex = /\[.*\]/s;

  // Ищем совпадение в строке
  const match = text.match(jsonRegex);

  if (!match) {
    console.log('JSON-объект или массив не найден.');
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch (error) {
    console.error('Ошибка парсинга JSON:', (error as any).message);
    return null;
  }
}

