import { Passport } from '../../entities/passport.js';
import type {
  ChatMessagesResult,
  CreateChatBody,
  CreateMessageDto,
  Role, Target,
} from '@shared/types';
import ChatRepository from '../../repositories/chat.repository.js';
import MessageRepository from '../../repositories/message.repository.js';
import { toMessageDto } from '../../mappers/message.mapper.js';
import { MessageService } from '../message.service.js';
import ProjectRepository from '../../repositories/project.repository.js';
import UserRepository from '../../repositories/user.repository.js';
import { Context } from './chat.meta.js';
import IdeaRepository from '../../repositories/idea.repository.js';

export class ChatService {
  static async create(body: CreateChatBody, passport?: Passport) {
    let context: Context = {
      passport,
      teacher: passport?.description ? { description: passport.description } : undefined,
    };

    if (body.userId) {
      const user = await UserRepository.findById(body.userId);
      if (!user) throw new Error('ChatService: идентификатор пользователя передан, а самого пользователя в базе нет');

      context.user = user;
    }

    if (body.projectId) {
      const project = await ProjectRepository.findById(body.projectId);
      if (!project) throw new Error('ChatService: идентификатор проекта передан, а самого проекта в базе нет');

      context.project = project;
    }

    if (body.ideaId) {
      const idea = await IdeaRepository.findById(body.ideaId);
      if (!idea) throw new Error('ChatService: идентификатор идеи передан, а самой идеи в базе нет');

      context.idea = idea;
    }

    return await ChatRepository.create({
      target: body.target,
      passportId: passport?.id || null,
      userId: body.userId || null,
      context,
    });
  }

  static async createMessages(chatId: number, body: { messages: CreateMessageDto[] }, passport?: Passport): Promise<ChatMessagesResult> {
    const chat = await ChatRepository.findById(chatId);
    if (!chat) throw new Error('Чат не найден');

    let resi;
    for (const message of body.messages) {
      const messageText = String(message?.content || '').trim();
      if (!messageText) continue;
      if (message.context) {
        await ChatRepository.update(chat.id, { context: { ...chat.context, ...(message.context as unknown as Context) } });
      };

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

    return {
      ...chat,
      messages: messages.map(toMessageDto),
    };
  }

  static async changeTarget(id: number, target: Target) {
    return ChatRepository.update(id, { target });
  }
}
