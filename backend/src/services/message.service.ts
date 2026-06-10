import MessageRepository from '../repositories/message.repository.js';
import type { ChatTarget } from '@shared/types';
import ChatRepository from '../repositories/chat.repository.js';
import { toMessage } from '../mappers/message.mapper.js';
import { Passport } from '../entities/passport.js';
import { buildMeta } from './chat/chat.meta.js';
import { Message } from '../entities/message.js';
import { getContent } from './chat/chat.runner.js';

export interface CreateAssistantMessageInput {
  chatId: number;
  content?: string;
  metadata?: string | null;
  target?: ChatTarget;
}

export class MessageService {
  static async create(body: { chatId: number; message: string; target: ChatTarget }, passport?: Passport ) {
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

    const meta = buildMeta(messages, passport);








    const { content, target } = await getContent(chat.target, meta, messages);

    const assistantMessage = await MessageService.createAssistantMessage({
      chatId: chat.id,
      content,
      target
    });

    await ChatRepository.touch(chat.id);

    return {
      chatId: chat.id,
      message: toMessage(assistantMessage),
    };
  }

  static async createAssistantMessage(input: CreateAssistantMessageInput) {
    const messageId = await MessageRepository.create({
      ...input,
      passportId: null,
      role: 'assistant',
      metadata: JSON.stringify(input.metadata),
    });

    return MessageRepository.findById(messageId);
  }
}
