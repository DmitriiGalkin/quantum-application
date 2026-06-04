import Message from '../models/message';
import { userAssistantAnswer } from 'assistants/userAssistant';
import { ideaAssistantAnswer } from 'assistants/ideaAssistant';
import { authAssistant } from './authService';
import User from "../models/user";
import Project from "../models/project";
import {teacherAssistantAnswer} from 'assistants/teacherAssistant';
import {projectAssistantAnswer} from 'assistants/projectAssistant';
import Idea from "../models/idea";
import IdeaUser from "../models/ideaUser";
import type { ChatMessage, ChatTarget, Meta } from '../../../application/src/types';
import { User as IUser } from '../../../application/src/types';
import { Idea as IIdea } from '../../../application/src/types';
import { Project as IProject } from '../../../application/src/types';
import { meetAssistantAnswer } from 'assistants/meetAssistant';


const getMetaMessages = (allMessages: ChatMessage[]) =>
  allMessages.reduce((acc: Meta, message: ChatMessage) => {
    const metadata = getObjectFromMetadata(message.metadata as any);
    if (!metadata) return acc;
    // @ts-ignore
    acc[metadata.target] = metadata.data;
    return acc;
  }, {});

// Эта функция остается без изменений, так как она просто форматирует данные.
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
  content: string;
  metadata: string | null;
  target: ChatTarget;
}

// Функция для создания сообщения от ассистента
async function createAssistantMessage({ chatId, content, metadata = null, target }: CreateAssistantMessage) {
  // Создаем сообщение в БД
  const assistantMessageId = await Message.create({
    id: 1,
    chatId,
    passportId: null,
    role: 'assistant',
    target,
    content,
    metadata,
  });

  // Находим и возвращаем полное сообщение (включая ID, createdAt и т.д.)
  // Это исправляет логическую ошибку, где возвращался только ID.
  return Message.findById(assistantMessageId);
}


function getObjectFromMetadata(metadata: string) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  }

  return null;
}

const selectAssistant = (target: ChatTarget, meta: Meta) => {

  switch (target) {

    // Создание идеи
    case 'idea': {
      if (!meta?.user) {
        return userAssistantAnswer;
      }
      if (!meta?.idea) {
        return ideaAssistantAnswer;
      }
      if (!meta?.passport) {
        return authAssistant;
      }

      return async () => {
        const userId = await User.create({id:1, ...meta.user, passportId: meta.passport?.id } as IUser)
        const ideaId = await Idea.create({ ...meta.idea, userId, passportId: meta.passport?.id } as unknown as IIdea);
        await IdeaUser.create({ ideaId, userId })

        return {
          content: `Идея проекта Вашего ребенка <a href="/idea/${ideaId}">создана</a>. Сейчас чат можно закрыть, но вы всегда можете ко мне вернуться и я помогу создать новую идею для вашего ребенка.`,
          target: 'idea',
        }
      };
    }

    // Создание проекта
    case 'project':{
      if (!meta?.teacher) {
        return teacherAssistantAnswer;
      }
      if (!meta?.project) {
        return projectAssistantAnswer;
      }
      if (!meta?.passport) {
        return authAssistant;
      }

      return async () => {
        const projectId = await Project.create({...meta.project, passportId: meta.passport?.id, ideaId: meta.project?.id} as IProject)

        return {
          content: `Все выяснили, теперь вы учитель <a href="/project/${projectId}">проекта</a>. Ваша первоочередная задача создать встречу, а я Вам с этим помогу`,
        }
      };
    }

    // Создание встречи
    case 'meet': {
      if (!meta?.meet) {
        return meetAssistantAnswer;
      }

      return async () => {
        return {
          content: 'Все выяснили, можно создавать встречу',
        }
      };
    }

    default: {
      return async () => {
        return {
          content: 'Сценарий не выявлен',
        }
      };
    }
  }
};

export {
  normalizeMessage,
  createAssistantMessage,
  getObjectFromMetadata,
  selectAssistant,
  getMetaMessages,
};
