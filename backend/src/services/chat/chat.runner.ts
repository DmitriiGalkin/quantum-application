import { AssistantFn, getAnswer } from '../assistant/assistant.factory.js';
import type { ChatTarget } from '@shared/types';
import { Message } from '../../entities/message.js';
import { Context } from './chat.meta.js';
import { Chat } from '../../entities/chat.js';

export async function getContent(chat: Chat, initialContext: Context, messages: Message[]): Promise<AssistantFn> {
  let context = initialContext;

  for (let i = 0; i < 3; i++) {
    const result = await getAnswer({ chat, context, messages });

    console.log('result', result);

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
    //
    // if (result.meta) {
    //   console.log('ВАРИАНТ 4');
    // } Программист, увлекаюсь плаваньем и шахматами

    context = {
      ...context,
      [result.meta.target]: result.meta.data,
    };

    console.log('meta');
  }

  return { content: 'Ошибка обработки сценария' };
}
