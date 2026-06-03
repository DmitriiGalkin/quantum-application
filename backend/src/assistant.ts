import GigaChat from 'gigachat';
import { Agent } from 'node:https';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

// 2. Проверка наличия ключа доступа ПЕРЕД отправкой запроса
if (!process.env.GIGA_CREDENTIALS) {
  throw new Error(
    'Ошибка конфигурации: Не найден ключ GIGA_CREDENTIALS в переменных окружения.',
  );
}

const assistant = new GigaChat({
  credentials: process.env.GIGA_CREDENTIALS,
  httpsAgent,
  timeout: 600,
  model: 'GigaChat',
});

export default assistant;
