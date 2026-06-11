import { Passport } from '../../entities/passport.js';
import { ChatTarget, CreateChatBody } from '@shared/types';
import ChatRepository from '../../repositories/chat.repository.js';
import MessageRepository from '../../repositories/message.repository.js';
import { toMessageDto } from '../../mappers/message.mapper.js';
import { getMetaMessages } from '../helper.js';

export class ChatService {
  static async create(body: CreateChatBody, passport?: Passport) {
    return await ChatRepository.create({
      target: body.target,
      passportId: passport?.id || null,
      userId: body.userId || null,
    });
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
      messages: messages.map(toMessageDto),
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
