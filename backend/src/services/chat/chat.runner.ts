import { AssistantFn, getAnswer } from '../assistant/assistant.factory.js';
import type { ChatTarget } from '@shared/types';
import { Message } from '../../entities/message.js';
import { Meta } from './chat.meta.js';
import { Chat } from '../../entities/chat.js';

export async function getContent(chat: Chat, initialMeta: Meta, messages: Message[]): Promise<AssistantFn> {
  let meta = initialMeta;

  for (let i = 0; i < 3; i++) {
    const result = await getAnswer({ chat, meta, messages });

    // Просто ответ
    if (!result.meta && result.content) {
      console.log('!result.meta && result.content');
      return { content: result.content, target: result.target, data: result.data };
    }

    // И ответ есть, и мета заполняется
    if (result.meta && result.content) {
      return { content: result.content, target: result.target, meta: result.meta, data: result.data };
    }

    if (!result.meta) {
      console.log('!result.meta');
      throw new Error('Пустой ответ от ассистентов');
    }

    meta = {
      ...meta,
      [result.meta.target]: result.meta.data,
    };

    console.log('meta');

  }

  return { content: 'Ошибка обработки сценария' };
}
