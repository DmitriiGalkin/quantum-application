import { buildMeta } from './chat.meta.js';
import { runChatAssistant } from './chat.runner.js';
import { Passport } from '../../entities/passport.js';
import { ChatTarget, Meta } from '@shared/types';
import ChatRepository from '../../repositories/chat.repository.js';
import { MessageService } from '../message.service.js';
import MessageRepository from '../../repositories/message.repository.js';
import { toMessage } from '../../mappers/message.mapper.js';
import { getMetaMessages } from '../helper.js';

export class ChatService {
  static async create(body: { target: ChatTarget }, passport?: Passport) {
    const chatId = await ChatRepository.create({
      target: body.target,
      passportId: passport?.id || null,
    });

    const { result } = await runChatAssistant(body.target, {} as Meta, []);

    await MessageService.createAssistantMessage({
      chatId,
      ...result,
    });

    return chatId;
  }

  static async createMessage(passport: Passport, body: any) {
    const messageText = String(body?.message || '').trim();
    if (!messageText) throw new Error('Сообщение не может быть пустым');

    const chat = await ChatRepository.findById(body.chatId);
    if (!chat) throw new Error('Чат не найден');

    const allMessages = await MessageRepository.findLastByChatId(chat.id, 100);

    const userMessageId = await MessageRepository.create({
      chatId: chat.id,
      content: messageText,
      role: 'user',
      target: allMessages.at(-1)?.target,
    });

    const messages = [
      ...allMessages,
      {
        id: userMessageId,
        content: messageText,
        role: 'user',
      },
    ];

    const meta = buildMeta(allMessages, passport);

    const { result, meta: updatedMeta } = await runChatAssistant(chat.target as ChatTarget, meta, messages);

    const assistantMessage = await MessageService.createAssistantMessage({
      chatId: chat.id,
      ...result,
    });

    await ChatRepository.touch(chat.id);

    return {
      chatId: chat.id,
      message: toMessage(assistantMessage),
      meta: updatedMeta,
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
      messages: messages.map(toMessage),
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
