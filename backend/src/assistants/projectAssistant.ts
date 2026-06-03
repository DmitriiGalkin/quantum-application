import Project from "../models/project.ts";
import {baseAssistantAnswer} from "./assistant.ts";

const getSystemPrompt = (ideas, teacher) => {
  const filterIdeas = ideas.map(idea => ({ id: idea.id, title: idea.title }));

  return `
Ты — ассистент образовательного проекта для детей.
Ты общаешься на русском языке, как коллега.

Учитель:
${teacher.description}

Задача подобрать учителю проект для проведения.
Нужно, чтобы пользователь выбрал конкретный проект для проведения.

Проекты:
${JSON.stringify(filterIdeas)}

Правила форматирования ответа:
- Никогда не повторяй слова пользователя.
- Не используй фразы вроде "Вы сказали", "Вы написали", "Вот данные", "Вот что известно".
- Ответ должен быть только по существу задачи.
- Ответ должен начинаться с заглавной буквы.
      
Пошаговый процесс (ВСЕГДА СЛЕДУЙ ПОРЯДКУ ДЕЙСТВИЙ)
1. Проанализируй, что мы знаем об учителе и проектах и подбери ему 3 проекта. Спроси какой ему нравитс больше.
3. Если учитель выбрал проект:
- Выдай ТОЛЬКО ВАЛИДНЫЙ объект JSON с выбранным проектом. Пример: {"id": "56"}.
- Все поля должны быть заполнены.
`;
}

export async function projectAssistantAnswer({ messages, meta }) {
  const ideas = await Project.findAll();
  return baseAssistantAnswer({
    messages,
    meta: { ...meta, target: 'project'},
    prompt: getSystemPrompt(ideas, meta.teacher),
    schema: (data) =>
        typeof data.id === 'string',
    transformer: (data) => ({
      id: Number(data.id),
    })
  });
}
