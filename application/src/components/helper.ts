import {
  type Chat,
  type ChatMessage,
  type ChatMessageRole,
  type Workflow,
  type ChatTarget,
} from '../requests.ts';

export const getWorkflowTarget = (workflow: Workflow, target: ChatTarget) => {
  const activeUserId = localStorage.getItem('activeUserId');
  switch (workflow) {
    case 'user_idea_passport': {
      if (!activeUserId) return 'user';
      if (target === 'user' && activeUserId) return 'idea';
      return 'none';
    }
  }
};

export const getCaption = (target: ChatTarget): string => {
  switch (target) {
    case 'user':
      return 'узнаю об участнике проекта';
    case 'idea':
      return 'помогаю придумать идею проекта';
    default:
      return 'отдыхаю';
  }
};

export const addOptimisticMessage = (content: string, role?: ChatMessageRole) => (oldChat: Chat) => {
  return {
    ...oldChat,
    messages: [
      ...((oldChat?.messages as []) || []),
      {
        id: Math.random().toString(), // Временный ID
        content,
        role: role || 'user',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      },
    ],
  };
};

export const addMessage = (message: ChatMessage) => (oldChat: Chat) => {
  return {
    ...oldChat,
    messages: [...(oldChat.messages as []), message],
  };
};

export const deleteOptimisticMessage = (oldChat: Chat) => {
  return {
    ...oldChat,
    messages: [...(oldChat.messages as []).slice(0, -1)],
  };
};