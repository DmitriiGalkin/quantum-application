import { baseAssistantAnswer } from '../base-assistant.js';
import { MeetAssistant } from '../../../entities/meet.assistant.js';
import { Message } from '../../../entities/message.js';
import { Context } from '../../chat/chat.meta.js';
import { Place } from '../../../entities/place.js';

const getPrompt = (place: Place) => {
  return `
Ты — ассистент образовательного проекта для детей.
Ты общаешься на русском языке, как коллега.

Задача помочь учителю создать встречу по проекту.
Нужно, чтобы пользователь выбрал конкретную дату, время и продолжительность.

Место проведения: ${place.title}

Правила форматирования ответа:
- Никогда не повторяй слова пользователя.
- Не используй фразы вроде "Вы сказали", "Вы написали", "Вот данные", "Вот что известно".
- Ответ должен быть только по существу задачи.
- Ответ должен начинаться с заглавной буквы.
      
Пошаговый процесс (ВСЕГДА СЛЕДУЙ ПОРЯДКУ ДЕЙСТВИЙ)
1. Проанализируй, что мы знаем об проекте и подбери ему дату, продолжительность и время проведения.
2. Если список НЕ СФОРМИРОВАН:
- Если информации мало, задавай вопросы для уточнения.
- Задай 1–3 уточняющих вопросов (например: «Как долго будет длиться встреча?»).
3. Если дата и время СФОРМИРОВАНЫ:
- Обобщи сказанное об встрече: дата, время, продолжительность. И задай вопрос (Например: "Все верно?")
- БЕЗ использования JSON формата.
- Не используй фраз: "Подтверждаю информацию"
4. Если информация ПОДТВЕРЖДЕНА пользователем (Например: "Верно"):
- Выдай ТОЛЬКО ВАЛИДНЫЙ объект JSON с ключами startedAt, duration. Пример: { "startedAt": "2026-11-17 15:00:00", "duration": 60 }.
- Все поля должны быть заполнены.
- Этот блок должен быть единственным.
`;
};

export async function meetAssistant(messages: Message[], context: Context) {
  if (!context.place) throw new Error('Ассистент meetAssistant: не определено место проведения');

  return baseAssistantAnswer({
    messages,
    prompt: getPrompt(context.place),
    schema: (data: MeetAssistant) => typeof data.startedAt === 'string' && typeof data.duration === 'number',
    transformer: (data: MeetAssistant): Context => ({
      ...context,
      draftMeet: {
        startedAt: data.startedAt,
        duration: data.duration || null,
        price: data.price || null,
      },
    }),
  });
}
