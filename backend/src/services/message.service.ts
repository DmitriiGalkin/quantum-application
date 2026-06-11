import MessageRepository from '../repositories/message.repository.js';
import type { ChatTarget, CreateMessage } from '@shared/types';
import ChatRepository from '../repositories/chat.repository.js';
import { toMessageDto } from '../mappers/message.mapper.js';
import { Passport } from '../entities/passport.js';
import { buildMeta } from './chat/chat.meta.js';
import { Message } from '../entities/message.js';
import { getContent } from './chat/chat.runner.js';
import UserRepository from '../repositories/user.repository.js';

export interface CreateAssistantMessageInput {
  chatId: number;
  content?: string;
  metadata?: string | null;
  target?: ChatTarget;
}

export class MessageService {
  static async create(body: CreateMessage, passport?: Passport) {
    const messageText = String(body?.message || '').trim();
    if (!messageText) throw new Error('Сообщение не может быть пустым');

    const chat = await ChatRepository.findById(body.chatId);
    if (!chat) throw new Error('Чат не найден');

    const lastMessages = await MessageRepository.findLastByChatId(chat.id, 100);

    const userMessageId = await MessageRepository.create({
      chatId: chat.id,
      content: messageText,
      role: 'user',
      target: lastMessages.at(-1)?.target,
    });

    const messages = [
      ...lastMessages,
      {
        id: userMessageId,
        content: messageText,
        role: 'user',
      } as Message,
    ];
    console.log(chat, 'chat');
    // программист, увлекаюсь бегом, плаванием, фортепиано, веду занятия с детьми по лего

    const user = chat.userId ? await UserRepository.findById(chat.userId) : null;
    const teacher = passport?.description ? { description: passport.description } : null;
    const meta = buildMeta(messages, passport || null, user, teacher);
    console.log(meta, 'meta');

    const { content, target, data } = await getContent(chat, meta, messages);
    console.log(data, 'data');

    const assistantMessage = await MessageService.createAssistantMessage({
      chatId: chat.id,
      content,
      target,
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
      metadata: JSON.stringify(input.metadata),
    });

    const message = await MessageRepository.findById(messageId);

    if (!message) throw new Error('createAssistantMessage: удивительно');

    return message;
  }
}
