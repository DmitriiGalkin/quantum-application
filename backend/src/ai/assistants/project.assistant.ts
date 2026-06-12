import IdeaModel from '../../repositories/idea.repository.js';
import { baseAssistantAnswer } from '../base-assistant.js';
import type { PassportDto } from '@shared/types';
import { AssistantAnswer } from './idea.assistant.js';
import type { Idea } from '../../entities/idea.js';
import { ProjectAssistant } from '../../entities/project.assistant.js';

const getSystemPrompt = (ideas: Idea[], teacher: PassportDto) => {
  const filterIdeas = ideas.map(idea => ({ id: idea.id, title: idea.title }));

  return `
Ты — ассистент образовательного проекта для детей.
Ты общаешься на русском языке, как коллега.

Учитель:
${teacher.description}

Задача подобрать учителю проект для проведения.
Нужно, чтобы пользователь выбрал конкретный проект для проведения.

Идеи:
${JSON.stringify(filterIdeas)}

Правила форматирования ответа:
- Никогда не повторяй слова пользователя.
- Не используй фразы вроде "Вы сказали", "Вы написали", "Вот данные", "Вот что известно".
- Ответ должен быть только по существу задачи.
- Ответ должен начинаться с заглавной буквы.
      
Пошаговый процесс (ВСЕГДА СЛЕДУЙ ПОРЯДКУ ДЕЙСТВИЙ)
1. Проанализируй, что мы знаем об учителе и идеях и подбери ему 3 идеи. Спроси какая ему нравится больше.
3. Если учитель выбрал проект:
- Выдай ТОЛЬКО ВАЛИДНЫЙ объект JSON с выбранной идеей. Пример: {"id": 56}.
- Все поля должны быть заполнены.
`;
}

export async function projectAssistant({ messages, meta }: AssistantAnswer) {
  const ideas = await IdeaModel.findAll({});
  return baseAssistantAnswer({
    messages,
    target: 'project',
    prompt: getSystemPrompt(ideas, meta.teacher),
    schema: (data: ProjectAssistant) => typeof data.id === 'number',
    transformer: (data: ProjectAssistant) => ({
      ideaId: data.id,
    }),
  });
}
