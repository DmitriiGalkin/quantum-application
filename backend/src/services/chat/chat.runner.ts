import { selectAssistant } from '../assistant/assistant.factory.js';
import type { ChatTarget, Meta } from '@shared/types';
import { Message } from '../../entities/message.js';

interface AssistantResult {
  content: string;
  meta?: {
    target: string;
    data: unknown;
  };
}

// runChatAssistant → крутит pipeline
export async function runChatAssistant(target: ChatTarget, initialMeta: Meta, messages: Message[]) {
  let meta = initialMeta;
  let result: AssistantResult;

  // 🔥 главный цикл
  for (let i = 0; i < 3; i++) {
    const assistant = selectAssistant(target, meta);

    result = await assistant({ messages, meta });

    // 👉 если нет meta — конец
    if (!result.meta) {
      return { result, meta };
    }

    // 👉 мержим meta
    meta = {
      ...meta,
      [result.meta.target]: result.meta.data,
    };
  }

  // fallback (защита от бесконечного цикла)
  return {
    result: {
      content: 'Ошибка обработки сценария',
    },
    meta,
  };
}
