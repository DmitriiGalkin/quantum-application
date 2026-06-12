import MessageRepository from '../repositories/message.repository.js';
import type { ChatTarget, CreateMessage } from '@shared/types';
import ChatRepository from '../repositories/chat.repository.js';
import { toMessageDto } from '../mappers/message.mapper.js';
import { Passport } from '../entities/passport.js';
import { buildMeta } from './chat/chat.meta.js';
import { Message } from '../entities/message.js';
import { getContent } from './chat/chat.runner.js';
import UserRepository from '../repositories/user.repository.js';
import PlaceRepository from '../repositories/place.repository.js';

export interface CreateAssistantMessageInput {
  chatId: number;
  content?: string;
  metadata?: any;
  target?: ChatTarget;
}

export class MessageService {
  static async create(body: CreateMessage, passport?: Passport) {
    console.log(body, 'BODY')

    const messageText = String(body?.message || '').trim();
    if (!messageText) throw new Error('Сообщение не может быть пустым');

    const chat = await ChatRepository.findById(body.chatId);
    if (!chat) throw new Error('Чат не найден');

    const lastMessages = await MessageRepository.findLastByChatId(chat.id, 1);

    const place = chat.target === 'meet' ? await PlaceRepository.findByTitle(messageText) : null;

    await MessageRepository.create({
      chatId: chat.id,
      content: messageText,
      role: 'user',
      target: lastMessages.at(-1)?.target,
      metadata: place ? { target: 'place', data: place } : undefined,
    });

    const messages = await MessageRepository.findLastByChatId(chat.id, 100);

    const user = chat.userId ? await UserRepository.findById(chat.userId) : null;
    const teacher = passport?.description ? { description: passport.description } : null;
    const meta = buildMeta(messages, passport || null, user, teacher);
    console.log(meta, 'META');

    const { content, target, data, meta: assistantMeta } = await getContent(chat, meta, messages);

    const assistantMessage = await MessageService.createAssistantMessage({
      chatId: chat.id,
      content,
      target,
      metadata: assistantMeta,
    });

    await ChatRepository.touch(chat.id);

    return {
      chatId: chat.id,
      message: toMessageDto(assistantMessage),
      data,
    };
  }

  static async createAssistantMessage(input: CreateAssistantMessageInput) {
    const messageId = await MessageRepository.create({
      ...input,
      passportId: null,
      role: 'assistant',
    });

    const message = await MessageRepository.findById(messageId);

    if (!message) throw new Error('createAssistantMessage: удивительно');

    return message;
  }
}
