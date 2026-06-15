import { Answer, getAnswer } from '../assistant/assistant.factory.js';
import { Message } from '../../entities/message.js';
import { Context } from './chat.meta.js';
import { Chat } from '../../entities/chat.js';

export async function getContent(chat: Chat, initialContext: Context, messages: Message[]): Promise<Answer> {
  let context = initialContext;

  for (let i = 0; i < 3; i++) {
    const result = await getAnswer({ chat, context, messages });

    if (result.content) {
      console.log('ВАРИАНТ 1: Ассистент дал словестный ответ, - значит его надо вернуть пользователю');
      return {
        content: result.content,
        context: result.context,
      };
    }

    if (!result.context) {
      throw new Error('Пустой ответ от ассистентов');
    }

    console.log('ВАРИАНТ 2: Ассистент выдал не просто словетный ответ, а обновленный конекст');
    context = result.context;
  }

  throw new Error('Ошибка обработки сценария');
}
