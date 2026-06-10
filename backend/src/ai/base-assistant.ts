import assistant from '../assistant.js';
import { extractJsonFromString } from './assistants/helper.js';
import type { MessageDto } from '@shared/types';
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

    //.filter(f => f.target === meta.target)

    console.log(payload, 'payload');

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
      console.log(data, 'data');

      if (!schema(data)) {
        console.error('Ошибка: структура JSON не соответствует ожидаемому формату.');
        return null;
      }
      const tData = transformer(data);
      const f = {
        content: userMessage,
        metadata: JSON.stringify({ target: meta.target, data: tData }),
        meta: data ? { target: meta.target, data: tData } : null,
        target: meta.target,
      };
      console.log(f, 'f');
      return f;
    }

    // 5. Формирование ответа
    return {
      content: userMessage,
      target: meta.target,
    };
  } catch (error) {
    console.error('Ошибка в baseAssistantAnswer:', error);

    return {
      status: 'error',
      message: 'Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.',
    };
  }
}






