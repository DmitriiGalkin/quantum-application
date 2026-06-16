import MessageRepository from '../repositories/message.repository.js';
import { ChatMessagesResult, ContextDto, CreateMessage, Role } from '@shared/types';
import ChatRepository from '../repositories/chat.repository.js';
import { toMessageDto } from '../mappers/message.mapper.js';
import { Passport } from '../entities/passport.js';
import { Context } from './chat/chat.meta.js';
import { getAnswerRunner } from './chat/chat.runner.js';

export class MessageService {
  static async create(body: CreateMessage, passport?: Passport): Promise<ChatMessagesResult> {
    const messageText = String(body?.message || '').trim();
    if (!messageText) throw new Error('Сообщение не может быть пустым');

    const chat = await ChatRepository.findById(body.chatId);
    if (!chat) throw new Error('Чат не найден');

    await MessageRepository.create({
      chatId: chat.id,
      content: messageText,
      role: Role.USER,
    });

    const messages = await MessageRepository.findLastByChatId(chat.id, 100);

    const context: Context = chat.context;

    const { content, context: newContext } = await getAnswerRunner(chat, context, messages);

    await ChatRepository.update(chat.id, { context: newContext });
    if (JSON.stringify(context) !== JSON.stringify(newContext)) {
      await MessageRepository.markChatAsRead(chat.id);
    }

    const messageId = await MessageRepository.create({
      chatId: chat.id,
      content,
      passportId: null,
      role: Role.ASSISTANT,
    });

    const message = await MessageRepository.findById(messageId);

    if (!message) throw new Error('createAssistantMessage: удивительно');

    await ChatRepository.touch(chat.id);
    console.log(newContext, 'newContext');

    return {
      message: toMessageDto(message),
      context: newContext as unknown as ContextDto,
    };
  }
}
