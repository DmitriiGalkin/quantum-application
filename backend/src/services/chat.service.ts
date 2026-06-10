import { normalizeMessage, createAssistantMessage, selectAssistant, getMetaMessages } from './helper.js';

import type { ChatTarget, Meta } from '@shared/types';
import ChatRepository from '../repositories/chat.repository.js';
import MessageRepository from '../repositories/message.repository.js';
import { Passport } from '../entities/passport.js';

export class ChatService {
  static async create(passport: Passport, body: any) {
    const chatId = await ChatRepository.create({
      target: body?.target,
      passportId: passport.id,
    });

    const meta: Meta = {} as Meta;

    const assistant = selectAssistant(body?.target, meta);

    const assistantContent = await assistant({
      messages: [],
      meta,
    });

    await createAssistantMessage({
      chatId,
      ...assistantContent,
    } as any);

    return chatId;
  }

  static async createMessage(passport: any, body: any) {
    const messageText = String(body?.message || '').trim();

    if (!messageText) {
      throw new Error('Сообщение не может быть пустым');
    }

    const chatId = body?.chatId;

    if (!chatId) {
      throw new Error('ID чата обязателен');
    }

    const chat = await ChatRepository.findById(chatId);
    if (!chat) {
      throw new Error('Чат не найден');
    }

    const allMessages = await MessageRepository.findLastByChatId(chat.id, 100);
    const lastUserMessage = allMessages.at(-1);

    const userMessageId = await MessageRepository.create({
      chatId: chat.id,
      content: messageText,
      role: 'user',
      target: lastUserMessage?.target,
    });

    const meta: Meta = {
      ...getMetaMessages(allMessages),
      teacher: {
        description: 'Профессия: учитель начальных классов...',
      },
      passport,
    };

    const assistant = selectAssistant(chat.target as ChatTarget, meta);

    let assistantContent = await assistant({
      messages: [
        ...allMessages,
        {
          id: userMessageId,
          content: messageText,
          role: 'user',
        } as any,
      ],
      meta,
    });

    if ((assistantContent as any)?.meta) {
      await MessageRepository.update(userMessageId, {
        metadata: (assistantContent as any).meta,
      });

      const newMeta = {
        ...meta,
        [(assistantContent as any).meta.target]: (assistantContent as any).meta.data,
      };

      const updatedAssistant = selectAssistant(chat.target as ChatTarget, newMeta as any);

      assistantContent = await updatedAssistant({
        messages: [
          ...allMessages,
          {
            id: userMessageId,
            content: messageText,
            role: 'user',
          } as any,
        ],
        meta: newMeta,
      });
    }

    const assistantMessage = await createAssistantMessage({
      chatId: chat.id,
      ...assistantContent,
    });

    await ChatRepository.touch(chat.id);

    return {
      chatId: chat.id,
      message: normalizeMessage(assistantMessage),
      meta,
    };
  }

  static async findMessages(chatId: number) {
    const chat = await ChatRepository.findById(chatId);

    if (!chat) {
      throw new Error('Чат не найден');
    }

    const messages = await MessageRepository.findByChatId(chat.id);
    const meta = getMetaMessages(messages);

    return {
      ...chat,
      messages: messages.map(normalizeMessage),
      meta,
    };
  }

  static async findAll(passport: Passport) {
    if (!passport) {
      throw new Error('Требуется авторизация');
    }

    return ChatRepository.findAllByPassportId(passport.id || 0);
  }
}
