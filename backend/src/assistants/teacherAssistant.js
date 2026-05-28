import {convertToTeacherObject} from './helper.js';
import assistant from '../assistant.js';

const SYSTEM_PROMPT = `
Ты — ассистент образовательного проекта для детей.
Ты общаешься на русском языке, как коллега.

Задача узнать от пользователя информацию о его увлечениях, основной профессии, опыте работы с детьми.
Нужно, чтобы пользователь сказал конкретную основную профессию, опыт работы с детьми и конкретные увлечения.

Правила форматирования ответа
- Никогда не повторяй слова пользователя.
- Не используй фразы вроде "Вы сказали", "Вы написали", "Вот данные", "Вот что известно".
- Не придумывай профессии.
- Не придумывай увлечения.
- Не придумывай опыт.
- Ответ должен быть только по существу задачи.
- Ответ должен начинаться с заглавной буквы.
      
Пошаговый процесс (ВСЕГДА СЛЕДУЙ ПОРЯДКУ ДЕЙСТВИЙ)
1. Проанализируй, что пользователь уже сказал рассказал о себе.
2. Если информация НЕ СФОРМИРОВАНА:
- Если информации мало, задавай вопросы для уточнения.
- Задай 1–3 уточняющих вопросов (например: «Какова ваша основная профессия?», «Какими увлечениями вы бы хотели поелиться с детьми?»,  «Есть ли у вас опыт ведения детских проктов?»).
3. Если информация СФОРМИРОВАНА:
- Обобщи сказанное о пользователе: увлечения, профессия, лпыт работы с детьми.
- БЕЗ использования JSON формата.
- Не используй фраз: "Подтверждаю информацию"
4. Если информация ПОДТВЕРЖДЕНА пользователем (Например: "Верно"):
- Выдай ТОЛЬКО ВАЛИДНЫЙ объект JSON с ключем profession, interests, experience. Пример: { "profession": "Программист", "interests": "шахматы, роликовые коньки, велосипед, плаванье, программирование", "experience": "2" }.
- Все поля должны быть заполнены.
- Этот блок должен быть единственным.
`;

export async function teacherAssistantAnswer({ messages }) {
  try {
    const payload = {
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    };

    console.log(payload);
    // 3. Отправка запроса к API
    const resp = await assistant.chat(payload);

    // 4. Проверка структуры ответа от API
    if (!resp || !resp.choices || resp.choices.length === 0) {
      throw new Error('Ошибка API: Получен пустой или некорректный ответ от сервера.');
    }

    const parsedData = resp.choices[0]?.message.content;
    console.log('Content: ', parsedData);

    // 1. Разделяем текст и JSON
    // Ищем начало блока кода ``` или просто первую скобку {
    const jsonStartIndex = parsedData.indexOf('{');
    // console.log('jsonStartIndex: ', jsonStartIndex);

    const userMessage =
      jsonStartIndex !== -1 ? parsedData.slice(0, jsonStartIndex).trim() : parsedData; // Текст для пользователя
    const jsonString = jsonStartIndex !== -1 ? parsedData.slice(jsonStartIndex).trim() : null; // Строка JSON

    const metadata = jsonString
      ? JSON.stringify({
          target: 'teacher',
          data: convertToTeacherObject(jsonString),
        })
      : null;

    return {
      content: userMessage,
      target: 'teacher',
      metadata,
      meta: jsonString ? {
        target: 'teacher',
        data: convertToTeacherObject(jsonString),
      } : null
    };
  } catch (error) {
    // Логируем техническую ошибку для разработчика
    console.error('Ошибка в generateAssistantAnswer:', error);

    // Возвращаем объект в СТРОГОМ формате, который ожидает ваш фронтенд/контроллер.
    // Это предотвращает падение всего приложения на клиенте.
    return {
      status: 'error', // Добавляем статус ошибки
      message:
        'Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.',
      idea: {
        title: 'Ошибка сервиса',
        description: 'Временные технические неполадки на стороне сервера.',
      },
    };
  }
}
