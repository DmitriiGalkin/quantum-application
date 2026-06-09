import { userAssistantAnswer } from '../assistants/userAssistant.js';
import { ideaAssistantAnswer } from '../assistants/ideaAssistant.js';
import { teacherAssistantAnswer } from '../assistants/teacherAssistant.js';
import { projectAssistantAnswer } from '../assistants/projectAssistant.js';
import { meetAssistantAnswer } from '../assistants/meetAssistant.js';


import type { MessageDto, ChatTarget, Meta, UserDto, ProjectDto } from '@shared/types';
import IdeaRepository from '../repositories/idea.repository.js';
import IdeaUserRepository from '../repositories/idea-user.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MessageRepository from '../repositories/message.repository.js';
import UserRepository from '../repositories/user.repository.js';
import type { User } from '../entities/user.js';

/**
 * Собирает мета-данные из сообщений
 */
const getMetaMessages = (messages: MessageDto[]): Meta =>
  messages.reduce((acc: Meta, message) => {
    const meta = getObjectFromMetadata(message.metadata as any);
    if (!meta?.target) return acc;

    (acc as any)[meta.target] = meta.data;
    return acc;
  }, {} as Meta);

/**
 * Нормализация сообщения из БД
 */
function normalizeMessage(row: any) {
  return {
    id: row.id,
    chatId: row.chatId,
    passportId: row.passportId,
    role: row.role,
    content: row.content,
    metadata: row.metadata,
    createdAt: row.createdAt,
    meta: getObjectFromMetadata(row.metadata),
  };
}

export interface CreateAssistantMessage {
  chatId: number;
  content?: string;
  metadata?: string | null;
  target?: ChatTarget;
}

/**
 * Создание сообщения ассистента
 */
async function createAssistantMessage({ chatId, content, metadata = null, target }: CreateAssistantMessage) {
  const messageId = await MessageRepository.create({
    chatId,
    passportId: null,
    role: 'assistant',
    target,
    content,
    metadata,
  } as any);

  return MessageRepository.findById(messageId);
}

/**
 * Парсинг metadata
 */
function getObjectFromMetadata(metadata: string | null | undefined) {
  if (!metadata || typeof metadata !== 'string') return null;

  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
}

/**
 * Выбор ассистента по сценарию
 */
const selectAssistant = (target: ChatTarget, meta: Meta) => {
  switch (target) {
    case 'idea': {
      if (!meta?.user) return userAssistantAnswer;
      if (!meta?.idea) return ideaAssistantAnswer;
      if (!meta?.passport) return authAssistant;

      return async () => {
        const userId = await UserRepository.create({
          ...meta.user,
          passportId: meta.passport?.id,
        } as User);

        const ideaId = await IdeaRepository.create({
          ...meta.idea,
          userId,
          passportId: meta.passport?.id,
          image: '',
        });

        await IdeaUserRepository.create({ ideaId, userId } as any);

        return {
          content: `Идея создана: <a href="/idea/${ideaId}">перейти</a>.`,
          target: 'idea',
        };
      };
    }

    case 'project': {
      if (!meta?.teacher) return teacherAssistantAnswer;
      if (!meta?.project) return projectAssistantAnswer;
      if (!meta?.passport) return authAssistant;

      return async () => {
        const projectId = await ProjectRepository.create({
          ...meta.project,
          passportId: meta.passport?.id,
          ideaId: (meta.project as any)?.id,
        } as ProjectDto);

        return {
          content: `Проект создан: <a href="/project/${projectId}">перейти</a>.`,
          target: 'project',
        };
      };
    }

    case 'meet': {
      if (!meta?.meet) return meetAssistantAnswer;

      return async () => ({
        content: 'Данные собраны, можно создавать встречу.',
        target: 'meet',
      });
    }

    default:
      return async () => ({
        content: 'Сценарий не определён',
      });
  }
};

/**
 * Ассистент авторизации
 */
export async function authAssistant() {
  try {
    return {
      content: 'Для продолжения, пожалуйста авторизуйтесь:',
      metadata: JSON.stringify({
        target: 'auth',
        data: ['google', 'yandex'],
      }),
    };
  } catch (error) {
    console.error('authAssistant error:', error);

    return {
      content: 'Ошибка сервиса. Попробуйте позже.',
      metadata: null,
    };
  }
}

export { normalizeMessage, createAssistantMessage, getObjectFromMetadata, selectAssistant, getMetaMessages };
