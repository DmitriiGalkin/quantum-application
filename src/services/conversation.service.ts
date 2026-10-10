import ConversationRepository from '../repositories/conversation.repository.js';
import ConversationPassportRepository from '../repositories/conversation-passport.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import Message2Repository from '../repositories/message2.repository.js';
import { mapConversationRow } from '../mappers/conversation.mapper.js';
import { db } from '../utils/dbNext.js';
import { HttpError } from '../utils/http-error.js';
import { requireId } from '../utils/validation.js';
import type { Conversation, ConversationHistory, StartConversationRequest, StartConversationResponse } from 'entities';

export class ConversationService {
  static async startConversation(request: StartConversationRequest): Promise<StartConversationResponse> {
    const targetId = requireId(request.targetPassportId);
    if (!(await PassportRepository.findById(targetId))) throw new HttpError('Получатель не найден', 404);
    return db.transaction(async conn => {
      // Serializing creation for the same pair avoids duplicate direct chats without a schema change.
      await PassportRepository.lockByIds([request.passportId, targetId], conn);
      const members = await ConversationPassportRepository.findByPassportIds([request.passportId, targetId], conn);
      const own = new Set(members.filter(member => member.passportId === request.passportId).map(member => member.conversationId));
      const sharedIds = members
        .filter(member => member.passportId === targetId && own.has(member.conversationId))
        .map(member => member.conversationId);
      const [existing] = await ConversationRepository.findByIds(sharedIds, conn);
      if (existing) return { exists: true, conversation: mapConversationRow(existing, request.passportId) };
      const id = await ConversationRepository.create(conn);
      await ConversationPassportRepository.addPassport(id, request.passportId, conn);
      if (targetId !== request.passportId) await ConversationPassportRepository.addPassport(id, targetId, conn);
      const [row] = await ConversationRepository.findByIds([id], conn);
      if (!row) throw new Error('Failed to create conversation');
      return { exists: false, conversation: mapConversationRow(row, request.passportId) };
    });
  }

  static async requireParticipant(id: number, passportId: number): Promise<void> {
    const participants = await ConversationPassportRepository.findPassports(id);
    if (!participants.some(member => member.passportId === passportId)) throw new HttpError('Нет доступа к диалогу', 403);
  }

  static async getConversationList(passportId: number): Promise<Conversation[]> {
    const members = await ConversationPassportRepository.findByPassportIds([passportId]);
    const rows = await ConversationRepository.findByIds(members.map(member => member.conversationId));
    return rows.map(row => mapConversationRow(row, passportId));
  }

  static async getConversationHistory(id: number, passportId: number): Promise<ConversationHistory | null> {
    const row = await ConversationRepository.findById(id);
    if (!row) return null;
    await this.requireParticipant(id, passportId);
    const messages = await Message2Repository.getByConversation(id);
    return { conversation: mapConversationRow(row, passportId), messages };
  }
}
