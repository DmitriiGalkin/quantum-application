import type { Chat, MessageDto, ChatMessageRole, ChatTarget } from '@shared/types';


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

export const addOptimisticMessage = (chat: Chat, content: string) => {
  return {
    ...chat,
    messages: [
      ...((chat?.messages as []) || []),
      {
        id: Math.random().toString(), // Временный ID
        content,
        role: 'user',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      },
    ],
  };
};

export const addMessage = (message: MessageDto) => (oldChat: Chat) => {
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