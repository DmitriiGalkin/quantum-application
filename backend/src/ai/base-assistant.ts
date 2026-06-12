import assistant from '../assistant.js';
import { extractJsonFromString } from './assistants/helper.js';
import { Message } from '../entities/message.js';

export interface BaseAssistantAnswer {
  prompt: string;
  messages: Message[];
  schema: any;
  transformer: any;
  meta: any;
}

/**
 * Базовая функция для взаимодействия с ассистентом.
 */
export async function baseAssistantAnswer({ prompt, messages, schema, transformer, meta }: BaseAssistantAnswer) {
  try {
    // 1. Подготовка полезной нагрузки (payload)
    const payload = {
      messages: [
        {
          role: 'system',
          content: prompt, // Вызов функции для получения промпта
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    };

    // 2. Отправка запроса к API
    const resp = await assistant.chat(payload);

    // 3. Проверка структуры ответа от API
    if (!resp || !resp.choices || resp.choices.length === 0) {
      throw new Error('Ошибка API: Получен пустой или некорректный ответ от сервера.');
    }

    const content = resp.choices[0]?.message.content;

    // 4. Разделение текста и JSON
    const data = extractJsonFromString(content);
    const userMessage = !data ? content : null;

    if (data) {
      if (!schema(data)) {
        console.log(data, 'data')
        throw new Error('Ошибка: структура JSON не соответствует ожидаемому формату.');
      }
      const tData = transformer(data);
      return {
        content: userMessage,
        meta: data ? { target: meta.target, data: tData } : undefined,
        target: meta.target,
      };
    }

    // 5. Формирование ответа
    return {
      content: userMessage,
      target: meta.target,
    };
  } catch (error) {
    console.error('Ошибка в baseAssistantAnswer:', error);

    throw new Error('Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.');
  }
}






