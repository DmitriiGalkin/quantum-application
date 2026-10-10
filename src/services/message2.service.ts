import { ConversationService } from './conversation.service.js';
import { HttpError } from '../utils/http-error.js';
import Message2Repository from '../repositories/message2.repository.js';
import type { CreateMessageRequest, Message, UpdateMessageRequest } from 'entities';

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
    return Message2Repository.create(conversationId, senderPassportId, request.content);
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