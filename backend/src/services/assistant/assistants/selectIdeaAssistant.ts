import IdeaModel from '../../../repositories/idea.repository.js';
import { baseAssistantAnswer } from '../base-assistant.js';
import type { Idea } from '../../../entities/idea.js';
import { ProjectAssistant } from '../../../entities/project.assistant.js';
import { Message } from '../../../entities/message.js';
import { Context, DraftTeacher } from '../../chat/chat.meta.js';
import { baseAssistantAnswer2 } from '../base-assistant2.js';
import { Ui } from '@shared/types';

const getSystemPrompt = (ideas: Idea[], teacher: DraftTeacher) => {
  const filterIdeas = ideas.map(idea => ({ id: idea.id, title: idea.title }));

  return `
Ты – ассистент образовательного проекта для детей, общающийся с учителями на профессиональном уровне.

Твоя задача помочь учителю, у которого нет опыта работы с детьми, подобрать подходящий образовательный проект из списка идей. Учитель интересуется ${teacher.description}.

Инструкция:
1. Изучи список доступных проектов и выбери три наиболее подходящие идеи исходя из интересов учителя.
2. Представь эти три идеи учителю и спроси, какая из них ему интересна больше всего.
3. После того, как учитель сделал выбор, выведи валидный JSON объект с выбранной идеей.

[{
  "id": <идентификатор выбранного проекта>,
  "title": <название выбранного проекта>
}]

Примеры:
[{
  "id": 12,
  "title": "Стимпанк-дневник юного футболиста с волшебным мячом"
}]

Критерии выбора:
- Проект должен включать элементы, связанные с интересами учителя.
- Предпочтение отдаётся проектам, связанным с творческими занятиями и активными играми.

Идеи:
${JSON.stringify(filterIdeas)}
`;
};

export async function selectIdeaAssistant(messages: Message[], context: Context) {
  const teacher = context.teacher ? context.teacher : context.draftTeacher;
  if (!teacher) throw new Error(`Нарушен сценарий 'projectAssistant': teacher не обнаружен`);

  const ideas = await IdeaModel.findAll({});

  return baseAssistantAnswer2({
    messages,
    prompt: getSystemPrompt(ideas, teacher),
    schema: (data: ProjectAssistant) => true,
    transformer: (data: ProjectAssistant[]): Context => ({
      ...context,
      ideas: (data.map(projectAssistant => ideas.find(idea => idea.id === projectAssistant.id) || null).filter(Boolean)) as Idea[],
      ui: Ui.IDEAS,
    }),
  });
}
