import {convertToTeacherObject} from './helper.js';
import assistant from '../assistant.js';
import Project from "../models/project.js";

const getSystemPrompt = (ideas, teacher) => {
  const filterIdeas = ideas.map(idea => ({ id: idea.id, title: idea.title, description: idea.description }));

  return `
Ты — ассистент образовательного проекта для детей.
Ты общаешься на русском языке, как коллега.

Задача подобрать учителю (${teacher.description}) релевантные проекты для их проведения.
Нужно, чтобы пользователь выбрал конкретные проекты для проведения.

Проекты:
${JSON.stringify(filterIdeas)}

Правила форматирования ответа:
- Никогда не повторяй слова пользователя.
- Не используй фразы вроде "Вы сказали", "Вы написали", "Вот данные", "Вот что известно".
- Ответ должен быть только по существу задачи.
- Ответ должен начинаться с заглавной буквы.
      
Пошаговый процесс (ВСЕГДА СЛЕДУЙ ПОРЯДКУ ДЕЙСТВИЙ)
1. Проанализируй, что учитель мы знаем об учителе и подбери ему релевантные идеи проектов.
2. Если список НЕ СФОРМИРОВАН:
- Если информации мало, задавай вопросы для уточнения.
- Задай 1–3 уточняющих вопросов (например: «Сколько человек может быть в вашей группе?», «Вас интересуют индивидуальные занятия или группы?»).
3. Если список СФОРМИРОВАН:
- Предложи 1-3 варианта проектов
- Оформляй название проектов с идентификатором (Например: "Танцующие слоны (id: 23)")
`;
}

export async function projectAssistantAnswer({ messages, meta }) {
  try {
    const ideas = await Project.findAll()
    const payload = {
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(ideas, meta.teacher),
        },
        ...messages.filter(m=>m.target==='project').map(m => ({ role: m.role, content: m.content })),
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
    const jsonStartIndex = parsedData.indexOf('[');
    // console.log('jsonStartIndex: ', jsonStartIndex);

    const userMessage =
      jsonStartIndex !== -1 ? parsedData.slice(0, jsonStartIndex).trim() : parsedData; // Текст для пользователя
    const jsonString = jsonStartIndex !== -1 ? parsedData.slice(jsonStartIndex).trim() : null; // Строка JSON

    const metadata = jsonString
      ? JSON.stringify({
          target: 'project',
          data: convertToTeacherObject(jsonString),
        })
      : null;

    return {
      content: userMessage,
      target: 'project',
      metadata,
      meta: jsonString ? {
        target: 'project',
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
