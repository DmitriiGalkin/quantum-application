import { Passport } from '../../entities/passport.js';
import { Chat, ChatMessagesResult, ChatTarget, CreateChatBody, CreateMessageDto, MessageDto } from '@shared/types';
import ChatRepository from '../../repositories/chat.repository.js';
import MessageRepository from '../../repositories/message.repository.js';
import { toMessageDto } from '../../mappers/message.mapper.js';
import { getMetaMessages } from '../helper.js';
import { MessageService } from '../message.service.js';
import PlaceRepository from '../../repositories/place.repository.js';

export class ChatService {
  static async create(body: CreateChatBody, passport?: Passport) {
    return await ChatRepository.create({
      target: body.target,
      passportId: passport?.id || null,
      userId: body.userId || null,
    });
  }

  static async createMessages(chatId: number, body: { messages: CreateMessageDto[] }, passport?: Passport): Promise<ChatMessagesResult> {
    const chat = await ChatRepository.findById(chatId);
    if (!chat) throw new Error('Чат не найден');

    let resi;
    for (const message of body.messages) {
      const messageText = String(message?.content || '').trim();
      if (!messageText) continue;

      const place = chat.target === 'place' ? await PlaceRepository.findByTitle(messageText) : null;

      if (message.role === 'assistant') {
        await MessageRepository.create({
          chatId: chat.id,
          content: messageText,
          passportId: null,
          role: 'assistant',
        });
      } else {
        resi = await MessageService.create(
          {
            chatId: chatId,
            message: messageText,
          },
          passport!,
        );
      }
    }

    if (!resi) throw new Error('createMessages: отсутствует ответ ассистента на сообщение пользователя');

    return resi;
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

  static async changeTarget(id: number, target: ChatTarget) {
    return ChatRepository.update(id, { target });
  }
}
