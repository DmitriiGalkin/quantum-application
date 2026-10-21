import { ConversationService } from './conversation.service.js';
import { HttpError } from '../utils/http-error.js';
import Message2Repository from '../repositories/message2.repository.js';
import type { CreateMessageRequest, Message, UpdateMessageRequest } from 'entities';
import { db } from '../utils/dbNext.js';
import ConversationPassportRepository from '../repositories/conversation-passport.repository.js';
import { NotificationService } from './notification.service.js';
import ConversationRepository from '../repositories/conversation.repository.js';
import PassportRepository from '../repositories/passport.repository.js';

export class Message2Service {
  private static async requireOwner(id: number, passportId: number): Promise<void> {
    const message = await Message2Repository.findById(id);
    if (!message) throw new HttpError('Сообщение не найдено', 404);
    if (message.senderPassportId !== passportId) throw new HttpError('Нет доступа к сообщению', 403);
    await ConversationService.requireParticipant(message.conversationId, passportId);
  }

  static async create(conversationId: number, senderPassportId: number, request: CreateMessageRequest): Promise<Message> {
    await ConversationService.requireParticipant(conversationId, senderPassportId);
    if (typeof request.content !== 'string' || !request.content.trim()) throw new HttpError('Сообщение не должно быть пустым', 400);
    return db.transaction(async conn => {
      await ConversationRepository.lockById(conversationId, conn);
      const isFirstMessage = (await Message2Repository.countByConversation(conversationId, conn)) === 0;
      const message = await Message2Repository.create(conversationId, senderPassportId, request.content,conn);
      if (isFirstMessage) {
        const recipients = (await ConversationPassportRepository.findPassports(conversationId,conn))
          .filter(member => member.passportId !== senderPassportId && !member.isMuted);
        const sender = await PassportRepository.findById(senderPassportId);
        await NotificationService.notify(recipients.map(member => member.passportId),`chat-${conversationId}-started`,
          'Новый чат',`Первое сообщение от ${sender?.title ?? 'пользователя'}.`,`/chats/${conversationId}`,conn);
      }
      return message;
    });
  }

  static async update(id: number, request: UpdateMessageRequest, passportId: number): Promise<boolean> {
    await this.requireOwner(id, passportId);
    if (typeof request.content !== 'string' || !request.content.trim()) throw new HttpError('Сообщение не должно быть пустым', 400);
    return Message2Repository.update(id, request);
  }

  static async delete(id: number, passportId: number): Promise<boolean> {
    await this.requireOwner(id, passportId);
    return Message2Repository.delete(id);
  }
}
