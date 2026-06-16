import assistant from '../../assistant.js';
import { extractJsonFromString, extractJsonFromString2 } from './assistants/helper.js';
import { Message } from '../../entities/message.js';
import { Answer } from './assistant.factory.js';
import { Role } from '@shared/types';

export interface GetBaseAssistantAnswer {
  prompt: string;
  messages: Message[];
  schema: (data: any) => boolean;
  transformer: (data: any) => any;
}

/**
 * Базовая функция для взаимодействия с ассистентом.
 */
export async function baseAssistantAnswer2({ prompt, messages, schema, transformer }: GetBaseAssistantAnswer): Promise<Answer> {
  try {
    const payload = {
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    };
    //console.log('payload', payload);

    const resp = await assistant.chat(payload);

    if (!resp || !resp.choices || resp.choices.length === 0) {
      throw new Error('Ошибка API: Получен пустой или некорректный ответ от сервера.');
    }

    const freeContent = resp.choices[0]?.message.content;

    // const freeContent =
    //   '[{\n' +
    //   '  "id": 38,\n' +
    //   '  "title": "Тайны подземного мира: создание модели норы крота"\n' +
    //   '}]\n' +
    //   '\n' +
    //   '\n' +
    //   'Этот проект идеально соответствует интересам учителя, так как включает изучение подземного мира кротов — темы, связанной с его увлечением. Занятия будут носить творческий и активный характер, поскольку дети смогут самостоятельно создавать модель норы крота, что обеспечит практическое применение знаний и развитие навыков конструирования.';

    const data = extractJsonFromString2(freeContent);
    const restText = freeContent.replace(/\[.*\]/s, '').trim();

    //const content = !data ? freeContent : null;
    //
    // console.log(freeContent, 'freeContent');
    // console.log(data, 'data');
    //
    // console.log(restText, 'restText');

    if (data) {
      if (!schema(data)) {
        console.log(data, 'data');
        throw new Error('Ошибка: структура JSON не соответствует ожидаемому формату.');
      }
      return {
        content: restText,
        context: transformer(data),
      };
    }

    return {
      content: restText,
    };

  } catch (error) {
    console.error('Ошибка в baseAssistantAnswer:', error);

    throw new Error('Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.');
  }
}
