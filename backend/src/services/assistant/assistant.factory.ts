import type { ChatTarget, Meta } from '@shared/types';

import { userAssistant } from '../../ai/assistants/user.assistant.js';
import { ideaAssistantAnswer } from '../../ai/assistants/idea.assistant.js';
import { teacherAssistantAnswer } from '../../ai/assistants/teacher.assistant.js';
import { projectAssistantAnswer } from '../../ai/assistants/project.assistant.js';
import { meetAssistantAnswer } from '../../ai/assistants/meet.assistant.js';

import { authAssistant } from './auth.assistant.js';
import { IdeaFlowService } from './flows/idea-flow.service.js';
import { ProjectFlowService } from './flows/project-flow.service.js';
import { Message } from '../../entities/message.js';

const FRONTEND_SERVER = process.env.FRONTEND_SERVER ?? 'http://localhost:3000';

type AssistantFn = Promise<{
  content?: string;
  meta?: {
    target: string;
    data: unknown;
  };
  target?: ChatTarget;
}>;

// selectAssistant → решает шаг
export async function getAnswer(target: ChatTarget, meta: Meta, messages: Message[]): AssistantFn {
  switch (target) {
    case 'idea':
      if (!meta?.user) return await userAssistant({ messages });

      if (!meta?.idea) return ideaAssistantAnswer({ messages, meta });

      if (!meta?.passport) return authAssistant();

      const ideaId = await IdeaFlowService.create(meta);

      return {
        content: `Идея ${FRONTEND_SERVER}/idea/${ideaId} создана`,
      };

    case 'project':
      if (!meta?.teacher) return teacherAssistantAnswer({ messages });

      if (!meta?.project) return projectAssistantAnswer({ messages, meta });

      if (!meta?.passport) return authAssistant();

      const projectId = await ProjectFlowService.create(meta);

        return {
          content: `Проект ${FRONTEND_SERVER}/project/${projectId} создан`,
        };

    case 'meet':
      if (!meta?.meet) return meetAssistantAnswer({ messages, meta });

      return{
        content: 'Данные собраны, можно создавать встречу.',
      };

    default:
      return {
        content: 'Сценарий не определён',
      };
  }
}