import type { ChatTarget, Meta } from '@shared/types';

import { userAssistantAnswer } from '../../assistants/userAssistant.js';
import { ideaAssistantAnswer } from '../../assistants/ideaAssistant.js';
import { teacherAssistantAnswer } from '../../assistants/teacherAssistant.js';
import { projectAssistantAnswer } from '../../assistants/projectAssistant.js';
import { meetAssistantAnswer } from '../../assistants/meetAssistant.js';

import { authAssistant } from './auth.assistant.js';
import { IdeaFlowService } from './flows/idea-flow.service.js';
import { ProjectFlowService } from './flows/project-flow.service.js';

export function selectAssistant(target: ChatTarget, meta: Meta) {
  switch (target) {
    case 'idea':
      if (!meta?.user) return userAssistantAnswer;
      if (!meta?.idea) return ideaAssistantAnswer;
      if (!meta?.passport) return authAssistant;

      return () => IdeaFlowService.create(meta);

    case 'project':
      if (!meta?.teacher) return teacherAssistantAnswer;
      if (!meta?.project) return projectAssistantAnswer;
      if (!meta?.passport) return authAssistant;

      return () => ProjectFlowService.create(meta);

    case 'meet':
      if (!meta?.meet) return meetAssistantAnswer;

      return async () => ({
        content: 'Данные собраны, можно создавать встречу.',
        target: 'meet',
      });

    default:
      return async () => ({
        content: 'Сценарий не определён',
      });
  }
}
