import { selectAssistant } from '../assistant/assistant.factory.js';
import type { ChatTarget, Meta } from '@shared/types';

export async function runChatAssistant(target: ChatTarget, meta: Meta, messages: any[]) {
  const assistant = selectAssistant(target, meta);

  let result = await assistant({ messages, meta }) as any;

  // 🔥 если ассистент вернул meta → перезапуск
  if (result?.meta) {
    const newMeta = {
      ...meta,
      [result.meta.target]: result.meta.data,
    };

    const updatedAssistant = selectAssistant(target, newMeta);

    result = await updatedAssistant({
      messages,
      meta: newMeta,
    });

    return { result, meta: newMeta };
  }

  return { result, meta };
}
