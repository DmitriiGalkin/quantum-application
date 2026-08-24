import Message2Repository from '../repositories/message2.repository.js';
import type { CreateMessageRequest, Message, UpdateMessageRequest } from 'entities';

export class Message2Service {
  static async create(conversationId: number, senderPassportId: number, request: CreateMessageRequest): Promise<Message> {
    return await Message2Repository.create(conversationId, senderPassportId, request.content);
  }

  static async update(id: number, request: UpdateMessageRequest): Promise<boolean> {
    return await Message2Repository.update(id, request);
  }

  static async delete(id: number): Promise<boolean> {
    return await Message2Repository.delete(id);
  }
}