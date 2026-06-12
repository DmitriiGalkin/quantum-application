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
      console.log('ВАРИАНТ 1');
      return { content: result.content, target: result.target, meta: result.meta, data: result.data };
    }

    // И ответ есть, и мета заполняется
    if (result.meta && result.content) {
      console.log('ВАРИАНТ 2');
      return { content: result.content, target: result.target, meta: result.meta, data: result.data };
    }

    if (!result.meta) {
      console.log('ВАРИАНТ 3');
      throw new Error('Пустой ответ от ассистентов');
    }

    if (result.meta) {
      console.log('ВАРИАНТ 4');
    }
    //
    // meta = {
    //   ...meta,
    //   [result.meta.target]: result.meta.data,
    // };

    console.log('meta');
  }

  return { content: 'Ошибка обработки сценария' };
}
