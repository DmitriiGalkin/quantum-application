import Chat from '../models/chat.js';
import Message from '../models/message.js';
import { userAssistantAnswer } from '../assistants/userAssistant.js';
import { ideaAssistantAnswer } from '../assistants/ideaAssistant.js';
import { authAssistant } from './authService.js';
import User from "../models/user.js";
import Project from "../models/project.js";
import {teacherAssistantAnswer} from "../assistants/teacherAssistant.js";
import {projectAssistantAnswer} from "../assistants/projectAssistant.js";
import Idea from "../models/idea.js";
import IdeaUser from "../models/ideaUser.js";


const getMetaMessages = allMessages =>
  allMessages.reduce((acc, message) => {
    const metadata = getObjectFromMetadata(message.metadata);
    if (!metadata) return acc;
    acc[metadata.target] = metadata.data;
    return acc;
  }, {});

// Эта функция остается без изменений, так как она просто форматирует данные.
function normalizeMessage(row) {
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

// Функция для получения или создания чата
async function getOrCreateChat({ chatId, passportId, firstMessage, target }) {
  if (chatId) {
    // Прямой вызов модели
    const existingChat = await Chat.findByIdAndPassportId(chatId, passportId);

    if (!existingChat) {
      const error = new Error('Чат не найден или у вас нет доступа');
      error.status = 404;
      throw error;
    }

    return existingChat;
  }

  // Логика для создания нового чата, если ID не был передан
  const title = firstMessage.length > 80 ? `${firstMessage.slice(0, 80)}...` : firstMessage;

  const createdChatId = await Chat.create({
    passportId,
    title,
    target,
  });

  console.log(createdChatId, 'createdChatId');

  // Находим и возвращаем созданный чат как объект
  return Chat.findById(createdChatId);
}

// Функция для создания сообщения от ассистента
async function createAssistantMessage({ chatId, content, metadata = null, target }) {
  // Создаем сообщение в БД
  const assistantMessageId = await Message.create({
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


function getObjectFromMetadata(metadata) {
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

/**
 * Выбор ассистента
 * @param target - цель кейся
 * @param meta - Все что знаем о текущей сессии пользователя
 */
const selectAssistant = (target, meta) => {
  console.log(meta,'meta selectAssistant')

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
        const userId = await User.create({...meta.user, passportId: meta.passport.id })
        const ideaId = await Idea.create({...meta.idea, userId, passportId: meta.passport.id })
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
        const projectId = await Project.create({...meta.project, passportId: meta.passport.id, ideaId: meta.project.id})

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
  getOrCreateChat,
  createAssistantMessage,
  getObjectFromMetadata,
  selectAssistant,
  getMetaMessages,
};
