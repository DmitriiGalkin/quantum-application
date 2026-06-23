import { userAssistant } from './assistants/user.assistant.js';
import { ideaAssistant } from './assistants/idea.assistant.js';
import { teacherAssistant } from './assistants/teacher.assistant.js';
import { selectIdeaAssistant } from './assistants/selectIdeaAssistant.js';
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
import { AssistantAnswer } from './base-assistant.js';
import UserRepository from '../../repositories/user.repository.js';
import { Idea } from '../../entities/idea.js';
import { User } from '../../entities/user.js';

const FRONTEND_SERVER = process.env.FRONTEND_SERVER ?? 'http://localhost:3000';

export interface GetAnswer {
  chat: Chat;
  context: Context;
  messages: Message[];
}



export async function getAnswer({ chat, context, messages }: GetAnswer): Promise<AssistantAnswer> {
  consoleGetAnswer(chat, context);

  switch (chat.target) {
    case 'idea':
      if (!context?.user && !context?.draftUser) return await userAssistant(messages, context);
      if (!context?.draftIdea) return ideaAssistant(messages, context);
      if (!context?.passport)
        return {
          content: 'Идея практически создана, пожалуйста авторизуйтесь',
          context: { ...context, ui: 'auth' },
        };

      const ideaId = await IdeaFlowService.create(context);
      const idea = await IdeaRepository.findById(ideaId) as Idea;

      const user = context.user ? context.user : ((await UserRepository.findById(idea.userId)) as unknown as User);

      if (!idea) throw new Error('Factory, idea: идея не создалась');

      console.log('context', context);
      return {
        content: `Идея ${FRONTEND_SERVER}/idea/${ideaId} создана`,
        context: { ...context, idea: {...idea, user }, ui: 'idea' },
      };

    case 'project':
      if (!context?.teacher && !context?.draftTeacher) return teacherAssistant(messages, context);
      if (!context?.idea) return selectIdeaAssistant(messages, context);
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
      if (!context?.passport)
        return {
          content: 'Для продолжения, пожалуйста авторизуйтесь:',
          context: { ...context, ui: 'auth' },
        };

      const projectId = await ProjectFlowService.create(context);
      const project = await ProjectRepository.findById(projectId);

      if (!project) throw new Error('Factory, project: проект не создался');

      await ChatService.changeTarget(chat.id, 'meet');

      return {
        content: `Отлично! Проект создан. Осталось выбрать место и время проведения первой встречи, а я помогу с подбором. `,
        context: { ...context, project, ui: 'project' },
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

      if (!meet) throw new Error('Factory, meet: встреча не создался');

      return {
        content: `Отлично! встерча ${FRONTEND_SERVER}/project/${context.project.id}#meet-${meetId} создана. Осталось скреситить пальци крестиком и дождаться пока встерча наполнится детьми.`,
        context: { ...context, meet, ui: 'meet' },
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
      place: !context?.place ? '❌' : '✅',
      draftMeet: !context?.draftMeet ? '❌' : '✅',
    },
  });
}
