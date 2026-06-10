import { buildMeta } from './chat.meta.js';
import { getContent } from './chat.runner.js';
import { Passport } from '../../entities/passport.js';
import { ChatTarget } from '@shared/types';
import ChatRepository from '../../repositories/chat.repository.js';
import { MessageService } from '../message.service.js';
import MessageRepository from '../../repositories/message.repository.js';
import { toMessage } from '../../mappers/message.mapper.js';
import { getMetaMessages } from '../helper.js';
import { Message } from '../../entities/message.js';

//Катя, 10 лет, увлекается скрапбукингом и езде на авто

export class ChatService {
  static async create(body: { target: ChatTarget }, passport?: Passport) {
    return await ChatRepository.create({
      target: body.target,
      passportId: passport?.id || null,
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
