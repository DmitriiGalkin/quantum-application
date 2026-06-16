import MessageRepository from '../repositories/message.repository.js';
import { ChatMessagesResult, ChatTarget, CreateMessage } from '@shared/types';
import ChatRepository from '../repositories/chat.repository.js';
import { toMessageDto } from '../mappers/message.mapper.js';
import { Passport } from '../entities/passport.js';
import { Context } from './chat/chat.meta.js';
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
  static async create(body: CreateMessage, passport?: Passport): Promise<ChatMessagesResult> {
    const messageText = String(body?.message || '').trim();
    if (!messageText) throw new Error('Сообщение не может быть пустым');

    const chat = await ChatRepository.findById(body.chatId);
    if (!chat) throw new Error('Чат не найден');

    await MessageRepository.create({
      chatId: chat.id,
      content: messageText,
      role: 'user',
    });

    const messages = await MessageRepository.findLastByChatId(chat.id, 100);

    const context: Context = chat.metadata || {
      draftUser: null,
      draftTeacher: null,
      idea: null,
      draftIdea: null,
      project: null,
      draftProject: null,
      place: null,
      meet: null,
      draftMeet: null,
      passport: passport ? passport : null,
      teacher: passport?.description ? { description: passport.description } : null,
      user: chat.userId ? await UserRepository.findById(chat.userId) : null,
      ui: ''
    };

    const { content, context: newContext } = await getContent(chat, context, messages);

    await ChatRepository.update(chat.id, { metadata: newContext });

    const assistantMessage = await MessageService.createAssistantMessage({
      chatId: chat.id,
      content,
    });

    await ChatRepository.touch(chat.id);
    console.log(newContext, 'newContext');

    return {
      message: toMessageDto(assistantMessage),
      ui: context.ui,
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
