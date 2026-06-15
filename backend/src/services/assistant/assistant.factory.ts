import { userAssistant } from './assistants/user.assistant.js';
import { ideaAssistant } from './assistants/idea.assistant.js';
import { teacherAssistant } from './assistants/teacher.assistant.js';
import { projectAssistant } from './assistants/project.assistant.js';
import { meetAssistant } from './assistants/meet.assistant.js';
import { IdeaFlowService } from './flows/idea-flow.service.js';
import { ProjectFlowService } from './flows/project-flow.service.js';
import { Message } from '../../entities/message.js';
import { Context } from '../chat/chat.meta.js';
import { ChatService } from '../chat/chat.service.js';
import { Chat } from '../../entities/chat.js';
import ProjectRepository from '../../repositories/project.repository.js';
import { MeetFlowService } from './flows/meet-flow.service.js';
import IdeaRepository from '../../repositories/idea.repository.js';
import MeetRepository from '../../repositories/meet.repository.js';
import PlaceRepository from '../../repositories/place.repository.js';

const FRONTEND_SERVER = process.env.FRONTEND_SERVER ?? 'http://localhost:3000';

export interface GetAnswer {
  chat: Chat;
  context: Context;
  messages: Message[];
}

export type Answer = Promise<{
  content?: string;
  context?: Context;
}>;

export async function getAnswer({ chat, context, messages }: GetAnswer): Promise<Answer> {
  consoleGetAnswer(chat, context);

  switch (chat.target) {
    case 'idea':
      if (!context?.user && !context?.draftUser) return await userAssistant(messages, context);
      if (!context?.draftIdea) return ideaAssistant(messages, context);
      if (!context?.passport)
        return {
          content: 'Для продолжения, пожалуйста авторизуйтесь:',
          context: { ...context, ui: 'auth' },
        };

      const ideaId = await IdeaFlowService.create(context);
      const idea = await IdeaRepository.findById(ideaId);

      return {
        content: `Идея ${FRONTEND_SERVER}/idea/${ideaId} создана`,
        context: { ...context, idea },
      };

    case 'project':
      if (!context?.teacher && !context?.draftTeacher) return teacherAssistant(messages, context);
      if (!context?.draftProject) return projectAssistant(messages, context);
      if (!context?.passport)
        return {
          content: 'Для продолжения, пожалуйста авторизуйтесь:',
          context: { ...context, ui: 'auth' },
        };

      const projectId = await ProjectFlowService.create(context);
      const project = await ProjectRepository.findById(projectId);
      await ChatService.changeTarget(chat.id, 'meet');

      return {
        content: `Отлично! проект ${FRONTEND_SERVER}/project/${projectId} создан. Осталось выбрать место и время проведения первой встречи, а я помогу с подбором.`,
        context: { ...context, project },
      };

    case 'meet':
      if (!context?.project) throw new Error('Ошибка обработки сценария meet: проект не определен');
      if (!context?.place) {
        const content = messages[messages.length - 1].content;
        const place = content ? await PlaceRepository.findByTitle(content) : null;
        if (place) {
          return {
            context: { ...context, place },
          };
        }

        return {
          content: 'Выберите место для встречи',
          context: { ...context, ui: 'map' },
        };
      }

      if (!context?.draftMeet) return meetAssistant(messages, context);

      const meetId = await MeetFlowService.create(context);
      const meet = await MeetRepository.findById(meetId);

      return {
        content: `Отлично! встерча ${FRONTEND_SERVER}/project/${context.project.id}#meet-${meetId} создана. Осталось скреситить пальци крестиком и дождаться пока встерча наполнится детьми.`,
        context: { ...context, meet },
      };

    default:
      return {
        content: 'Сценарий не определён',
        context,
      };
  }
}

function consoleGetAnswer(chat: Chat, context: Context) {
  console.log({
    target: chat.target,
    meta: {
      user: !context?.user ? '❌' : '✅',
      draftUser: !context?.draftUser ? '❌' : '✅',
      draftIdea: !context?.draftIdea ? '❌' : '✅',
      passport: !context?.passport ? '❌' : '✅',
      teacher: !context?.teacher ? '❌' : '✅',
      draftTeacher: !context?.draftTeacher ? '❌' : '✅',
      project: !context?.project ? '❌' : '✅',
      draftProject: !context?.draftProject ? '❌' : '✅',
      place: !context?.place ? '❌' : '✅',
      draftMeet: !context?.draftMeet ? '❌' : '✅',
    },
  });
}
