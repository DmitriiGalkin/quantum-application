import ConversationRepository from '../repositories/conversation.repository.js';
import Message2Repository from '../repositories/message2.repository.js';
import { mapConversationRow } from '../mappers/conversation.mapper.js';
import { Conversation, Message, StartConversationRequest } from '@shared/types';

export class ConversationService {
  static async startConversation(request: StartConversationRequest): Promise<Conversation> {
    const conversationId = await ConversationRepository.createIndividual(request.passportId);
    const conversationRow = await ConversationRepository.findById(conversationId);
    if (!conversationRow) throw new Error('Failed to create conversation');
    return mapConversationRow(conversationRow);
  }

  static async getConversationList(passportId: number): Promise<Conversation[]> {
    const rows = await ConversationRepository.findUserConversations(passportId);
    return rows.map(mapConversationRow);
  }

  static async getConversationHistory(id: number): Promise<{ conversation: Conversation; messages: Message[] } | null> {
    const conversationRow = await ConversationRepository.findById(id);
    if (!conversationRow) return null;
    
    const messages = await Message2Repository.getByConversation(id);
    
    return {
      conversation: mapConversationRow(conversationRow),
      messages
    };
  }
}
