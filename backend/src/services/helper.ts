import type { Meta } from '@shared/types';
import type { Message } from '../entities/message.js';


/**
 * Парсинг metadata
 */
function getObjectFromMetadata(metadata: string | null | undefined) {
  if (!metadata || typeof metadata !== 'string') return null;

  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
}

/**
 * Собирает мета-данные из сообщений
 */
const getMetaMessages = (messages: Message[]): Meta =>
  messages.reduce((acc: Meta, message) => {
    const meta = getObjectFromMetadata(message.metadata as any);
    if (!meta?.target) return acc;

    (acc as any)[meta.target] = meta.data;
    return acc;
  }, {} as Meta);

export { getObjectFromMetadata, getMetaMessages };
