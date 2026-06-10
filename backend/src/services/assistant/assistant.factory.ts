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

type AssistantFn = (input: { messages: Message[]; meta: Meta }) => Promise<{
  content: string;
  meta?: {
    target: string;
    data: unknown;
  };
}>;

// selectAssistant → решает шаг
export function selectAssistant(target: ChatTarget, meta: Meta): AssistantFn {
  switch (target) {
    case 'idea':
      if (!meta?.user) return userAssistant;

      if (!meta?.idea) return ideaAssistantAnswer;

      if (!meta?.passport) return authAssistant;

      return async () => {
        const data = await IdeaFlowService.create(meta);

        return {
          content: `Идея создана`,
          meta: {
            target: 'idea',
            data,
          },
        };
      };

    case 'project':
      if (!meta?.teacher) return teacherAssistantAnswer;

      if (!meta?.project) return projectAssistantAnswer;

      if (!meta?.passport) return authAssistant;

      return async () => {
        const data = await ProjectFlowService.create(meta);

        return {
          content: `Проект создан`,
          meta: {
            target: 'project',
            data,
          },
        };
      };

    case 'meet':
      if (!meta?.meet) return meetAssistantAnswer;

      return async () => ({
        content: 'Данные собраны, можно создавать встречу.',
      });

    default:
      return async () => ({
        content: 'Сценарий не определён',
      });
  }
}