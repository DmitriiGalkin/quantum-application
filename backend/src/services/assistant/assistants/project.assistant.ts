import IdeaModel from '../../../repositories/idea.repository.js';
import { baseAssistantAnswer } from '../base-assistant.js';
import type { Idea } from '../../../entities/idea.js';
import { ProjectAssistant } from '../../../entities/project.assistant.js';
import { Message } from '../../../entities/message.js';
import { Context, DraftTeacher } from '../../chat/chat.meta.js';

const getSystemPrompt = (ideas: Idea[], teacher: DraftTeacher) => {
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
};

export async function projectAssistant(messages: Message[], context: Context) {
  const teacher = context.teacher ? context.teacher : context.draftTeacher;
  if (!teacher) throw new Error(`Нарушен сценарий 'projectAssistant': teacher не обнаружен`);

  const ideas = await IdeaModel.findAll({});
  return baseAssistantAnswer({
    messages,
    prompt: getSystemPrompt(ideas, teacher),
    schema: (data: ProjectAssistant) => typeof data.id === 'number',
    transformer: (data: ProjectAssistant): Context => ({
      ...context,
      draftProject: {
        ideaId: data.id,
      },
    }),
  });
}
