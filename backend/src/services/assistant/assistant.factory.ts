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
import { Meta } from '../chat/chat.meta.js';
import { PassportService } from '../passport.service.js';
import { ChatService } from '../chat/chat.service.js';
import { Chat } from '../../entities/chat.js';
import { placeAssistant } from '../../ai/assistants/place.assistant.js';
import IdeaRepository from '../../repositories/idea.repository.js';
import ProjectRepository from '../../repositories/project.repository.js';
import { MeetFlowService } from './flows/meet-flow.service.js';

const FRONTEND_SERVER = process.env.FRONTEND_SERVER ?? 'http://localhost:3000';

export interface GetAnswer {
  chat: Chat;
  meta: Meta;
  messages: Message[];
}

export type AssistantFn = Promise<{
  content?: string;
  meta?: {
    target: string;
    data: unknown;
  };
  data?: any[];
  target?: ChatTarget;
}>;

// selectAssistant → решает шаг
export async function getAnswer({ chat, meta, messages }: GetAnswer): AssistantFn {
  console.log({
    target: chat.target,
    meta: {
      user: !meta?.user ? '❌' : '✅',
      idea: !meta?.idea ? '❌' : '✅',
      passport: !meta?.passport ? '❌' : '✅',
      teacher: !meta?.teacher ? '❌' : '✅',
      project: !meta?.project ? '❌' : '✅',
      place: !meta?.place ? '❌' : '✅',
      meet: !meta?.meet ? '❌' : '✅',
    },
  });

  switch (chat.target) {
    case 'idea':
      if (!meta?.user) return await userAssistant({ messages });
      if (!meta?.idea) return ideaAssistant({ messages, meta });
      if (!meta?.passport) return authAssistant();

      const ideaId = await IdeaFlowService.create(meta);

      return {
        content: `Идея ${FRONTEND_SERVER}/idea/${ideaId} создана`,
      };

    case 'project':
      if (!meta?.teacher) return teacherAssistant({ messages });
      if (!meta?.project) return projectAssistant({ messages, meta });
      if (!meta?.passport) return authAssistant();

      await PassportService.updateFromMeta(meta);
      const projectId = await ProjectFlowService.create(meta);
      const project = await ProjectRepository.findById(projectId);

// надо сохранить проект в мету как то
      await ChatService.changeTarget(chat.id, 'meet');

      console.log(chat.id, 'chat.id');

      return {
        content: `Отлично! проект ${FRONTEND_SERVER}/project/${projectId} создан. Осталось выбрать место и время проведения первой встречи, а я помогу с подбором.`,
        meta: {
          target: 'project',
          data: project,
        },
      };

    case 'meet':
      if (!meta?.place) return placeAssistant();
      if (!meta?.meet) {
        const f = await meetAssistant({ messages, meta })
        //console.log(f, 'meetAssistant RESULT');
        return f
      };

      const meetId = await MeetFlowService.create(meta);

      return {
        content: `Отлично! встерча ${FRONTEND_SERVER}/project/${meta.project.id}#meet-${meetId} создана. Осталось скреситить пальци крестиком и дождаться пока встерча наполнится детьми.`,
      };

    default:
      return {
        content: 'Сценарий не определён',
      };
  }
}
