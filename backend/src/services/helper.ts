import type { Message } from '../entities/message.js';
import { Meta } from './chat/chat.meta.js';

/**
 * Собирает мета-данные из сообщений
 */
const getMetaMessages = (messages: Message[]): Meta =>
  messages.reduce((acc: Meta, message) => {
    const meta = message.metadata;
    if (!meta?.target) return acc;

    (acc as any)[meta.target] = meta.data;
    return acc;
  }, {} as Meta);

export { getMetaMessages };
