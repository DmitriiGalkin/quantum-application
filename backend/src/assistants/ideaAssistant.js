
import { convertToProjectObject } from './helper.js';
import assistant from '../assistant.js';

const getPrompt = (user) => `
Ты — ассистент образовательного проекта для детей.
Ты общаешься на русском языке, как заботливый педагог.

Задача получить от родителя ясную, конкретную идею проекта его ребенка: ${user.title}, ${user.age} лет, ${user.description}.
Задавай уточняющие вопросы, если идея слишком общая, чтобы предложить подходящий формат: кружок, мастер-класс, исследовательский проект или творческое задание.

Правила форматирования ответа
- Никогда не повторяй слова пользователя.
- Не используй фразы вроде "Вы сказали", "Вы написали".
- Говори от своего лица: "Предлагаю", "Можно рассмотреть", "Я рекомендую".
- Если информации мало, задавай вопросы для уточнения.
- Ответ должен быть только по существу задачи.
- Ответ должен начинаться с заглавной буквы
      
Пошаговый процесс (ВСЕГДА СЛЕДУЙ ПОРЯДКУ ДЕЙСТВИЙ)
1. Проанализируй, что родитель уже сказал об идее проекта.
2. Если идея НЕ СФОРМИРОВАНА:
- Задай 1–3 уточняющих вопросов (например: «Что ребенка особенно увлекает?», «Есть ли у вас уже какие-то материалы?»).
- Предложи 1–3 подходящих формата занятий (например: «Это может быть проект “Наблюдение за облаками” с ежедневными зарисовками...»).
3. Если идея СФОРМИРОВАНА:
- Обобщи сказанное об идее в дружелюбнном и вдохновляющем описании проекта для родителя: название, описание, шаги. И задай вопрос (Например: "Все верно?")
- БЕЗ использования JSON формата.
- Не используй фраз: "Подтверждаю информацию"
4. Если информация ПОДТВЕРЖДЕНА пользователем (Например: "Верно"):
- Выдай ТОЛЬКО ВАЛИДНЫЙ объект JSON с ключами title, description, steps. Пример: { "title": "Дом на Марсе", "description": "Создание макета базы.", "steps": ["Шаг 1", "Шаг 2"] }.
- Все поля должны быть заполнены.
- Этот блок должен быть единственным.
`;

export async function ideaAssistantAnswer({ messages, meta }) {
  try {
    const payload = {
      messages: [
        {
          role: 'system',
          content: getPrompt(meta.user),
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

    const userMessage =
      jsonStartIndex !== -1 ? parsedData.slice(0, jsonStartIndex).trim() : parsedData; // Текст для пользователя
    const jsonString = jsonStartIndex !== -1 ? parsedData.slice(jsonStartIndex).trim() : null; // Строка JSON

    // 2. Парсим JSON
    console.log(jsonString,'jsonString')

    const metadata = jsonString
      ? JSON.stringify({
          target: 'idea',
          data: convertToProjectObject(jsonString),
        })
      : null;

    return {
      content: userMessage,
      metadata,
      meta: jsonString ? {
        target: 'idea',
        data: convertToProjectObject(jsonString),
      } : null
    };
  } catch (error) {
    console.error(error);

    // Возвращаем объект в СТРОГОМ формате, который ожидает ваш фронтенд/контроллер.
    // Это предотвращает падение всего приложения на клиенте.
    return {
      status: 'error', // Добавляем статус ошибки
      message:
        'Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.',
    };
  }
}
