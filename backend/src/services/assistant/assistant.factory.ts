import type { ChatTarget, Meta } from '@shared/types';

import { userAssistant } from '../../ai/assistants/user.assistant.js';
import { ideaAssistantAnswer } from '../../ai/assistants/idea.assistant.js';
import { teacherAssistantAnswer } from '../../ai/assistants/teacher.assistant.js';
import { projectAssistantAnswer } from '../../ai/assistants/project.assistant.js';
import { meetAssistantAnswer } from '../../ai/assistants/meet.assistant.js';

import { authAssistant } from './auth.assistant.js';
import { IdeaFlowService } from './flows/idea-flow.service.js';
import { ProjectFlowService } from './flows/project-flow.service.js';

export function selectAssistant(target: ChatTarget, meta: Meta): Promise<{ content: string, target: ChatTarget }> {
  switch (target) {
    case 'idea':
      console.log('1');
      if (!meta?.user) return userAssistant;
      console.log('2');

      if (!meta?.idea) return ideaAssistantAnswer;
      console.log('3');

      if (!meta?.passport) return authAssistant;
      console.log('4');


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
