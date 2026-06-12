import type { ChatTarget } from '@shared/types';

import { userAssistant } from '../../ai/assistants/user.assistant.js';
import { ideaAssistant } from '../../ai/assistants/idea.assistant.js';
import { teacherAssistant } from '../../ai/assistants/teacher.assistant.js';
import { projectAssistant } from '../../ai/assistants/project.assistant.js';
import { meetAssistant } from '../../ai/assistants/meet.assistant.js';

import { authAssistant } from './auth.assistant.js';
import { IdeaFlowService } from './flows/idea-flow.service.js';
import { ProjectFlowService } from './flows/project-flow.service.js';
import { Message } from '../../entities/message.js';
import { Context } from '../chat/chat.meta.js';
import { PassportService } from '../passport.service.js';
import { ChatService } from '../chat/chat.service.js';
import { Chat } from '../../entities/chat.js';
import { placeAssistant } from '../../ai/assistants/place.assistant.js';
import ProjectRepository from '../../repositories/project.repository.js';
import { MeetFlowService } from './flows/meet-flow.service.js';
import PassportRepository from '../../repositories/passport.repository.js';

const FRONTEND_SERVER = process.env.FRONTEND_SERVER ?? 'http://localhost:3000';

export interface GetAnswer {
  chat: Chat;
  context: Context;
  messages: Message[];
}

export type AssistantFn = Promise<{
  content?: string;
  meta?: {
    target: string;
    data: unknown;
  };
  context: Context;
  data?: any[];
  target: ChatTarget;
}>;

export async function getAnswer({ chat, context, messages }: GetAnswer): AssistantFn {
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
      meet: !context?.meet ? '❌' : '✅',
    },
  });

  // Ваня, 10 лет, увлекается лыжами и рисованием
  // рисуем зимние виды спорта

  switch (chat.target) {
    case 'idea':
      if (!context?.user && !context?.draftUser) return await userAssistant(messages);
      if (!context?.draftIdea) return ideaAssistant({ messages, user: context.user ? context.user : context.draftUser });
      if (!context?.passport) return authAssistant();

      const ideaId = await IdeaFlowService.create(context);

      return {
        content: `Идея ${FRONTEND_SERVER}/idea/${ideaId} создана`,
      };

    case 'project':
      if (!context?.teacher && !context?.draftTeacher) return teacherAssistant(messages);
      if (!context?.draftProject) return projectAssistant({ messages, teacher: context.teacher });
      if (!context?.passport) return authAssistant();

      const projectId = await ProjectFlowService.create(context);
      const project = await ProjectRepository.findById(projectId);
      await ChatService.changeTarget(chat.id, 'meet');

      return {
        content: `Отлично! проект ${FRONTEND_SERVER}/project/${projectId} создан. Осталось выбрать место и время проведения первой встречи, а я помогу с подбором.`,
        meta: {
          target: 'project',
          data: project,
        },
      };

    case 'meet':
      if (!context?.project)
        return {
          content: 'Амнезия: не знаю для какого проекта создаем встречу',
        };
      if (!context?.place) return placeAssistant();
      if (!context?.meet) return meetAssistant(messages);

      const meetId = await MeetFlowService.create(context);

      return {
        content: `Отлично! встерча ${FRONTEND_SERVER}/project/${context.project.id}#meet-${meetId} создана. Осталось скреситить пальци крестиком и дождаться пока встерча наполнится детьми.`,
      };

    default:
      return {
        content: 'Сценарий не определён',
      };
  }
}
