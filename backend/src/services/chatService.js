import Chat from '../models/chat.js';
import ChatMessage from '../models/chatMessage.js';
import { userGenerateAssistantAnswer } from './userAssistantService.js';
import { generateAssistantAnswer,  } from './assistantService.js';
import { authAssistant } from './authService.js';

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
    source: row.source,
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
async function createAssistantMessage({ chatId, content, metadata = null }) {
  // Создаем сообщение в БД
  const assistantMessageId = await ChatMessage.create({
    chatId,
    passportId: null,
    role: 'assistant',
    content,
    metadata,
    source: 'text',
  });

  // Находим и возвращаем полное сообщение (включая ID, createdAt и т.д.)
  // Это исправляет логическую ошибку, где возвращался только ID.
  return ChatMessage.findById(assistantMessageId);
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

const selectAssistant = (workflow, meta) => {
  if (workflow === 'user_idea_passport') {
    if (!meta?.user) {
      return userGenerateAssistantAnswer;
    }
    if (!meta?.idea) {
      return generateAssistantAnswer;
    }

    return authAssistant;
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
