import { getAnswer } from '../assistant/assistant.factory.js';
import type { ChatTarget } from '@shared/types';
import { Message } from '../../entities/message.js';
import { Meta } from './chat.meta.js';

export async function getContent(target: ChatTarget, initialMeta: Meta, messages: Message[]): Promise<{ content: string; target?: ChatTarget }> {
  let meta = initialMeta;

  for (let i = 0; i < 3; i++) {
    const result = await getAnswer(target, meta, messages);

    if (!result.meta) {
      return { content: result.content, target: result.target };
    }

    meta = {
      ...meta,
      [result.meta.target]: result.meta.data,
    };
  }

  return { content: 'Ошибка обработки сценария' };
}
