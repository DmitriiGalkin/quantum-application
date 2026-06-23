import assistant from '../../assistant.js';
import { extractJsonFromString } from './assistants/helper.js';
import { Message } from '../../entities/message.js';
import { Context } from '../chat/chat.meta.js';

export interface GetBaseAssistantAnswer {
  prompt: string;
  messages: Message[];
  schema: (data: any) => boolean;
  transformer: (data: any) => any;
}

export type AssistantAnswer = Promise<{
  content?: string;
  context?: Context;
}>;

/**
 * Базовая функция для взаимодействия с ассистентом.
 */
export async function baseAssistantAnswer({ prompt, messages, schema, transformer }: GetBaseAssistantAnswer): Promise<AssistantAnswer> {
  try {
    const payload = {
      messages: [
        {
          role: 'system',
          content: prompt, // Вызов функции для получения промпта
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    };
    console.log('payload', payload);

    const resp = await assistant.chat(payload);

    if (!resp || !resp.choices || resp.choices.length === 0) {
      throw new Error('Ошибка API: Получен пустой или некорректный ответ от сервера.');
    }

    const freeContent = resp.choices[0]?.message.content;

    const data = extractJsonFromString(freeContent);
    const content = !data ? freeContent : null;

    if (data) {
      if (!schema(data)) {
        console.log(data, 'data');
        throw new Error('Ошибка: структура JSON не соответствует ожидаемому формату.');
      }
      return {
        context: transformer(data),
      };
    }

    return { content };
  } catch (error) {
    console.error('Ошибка в baseAssistantAnswer:', error);

    throw new Error('Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.');
  }
}
