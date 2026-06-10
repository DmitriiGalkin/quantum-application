import MessageRepository from '../repositories/message.repository.js';
import type { ChatTarget } from '@shared/types';

export interface CreateAssistantMessageInput {
  chatId: number;
  content?: string;
  metadata?: string | null;
  target?: ChatTarget;
}

export class MessageService {
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
