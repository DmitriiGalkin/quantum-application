import type { Message } from '../entities/message.js';
import { Context } from './chat/chat.meta.js';

/**
 * Собирает мета-данные из сообщений
 */
const getMetaMessages = (messages: Message[]): Context =>
  messages.reduce((acc: Context, message) => {
    const meta = message.metadata;
    if (!meta?.target) return acc;

    (acc as any)[meta.target] = meta.data;
    return acc;
  }, {} as Context);

export { getMetaMessages };
