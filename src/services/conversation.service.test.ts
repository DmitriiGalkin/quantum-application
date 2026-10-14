import { beforeEach, expect, it, vi } from 'vitest';
import type { ConversationPassportRow, ConversationRow, Message, Passport } from 'entities';
vi.mock('../utils/dbNext.js', () => ({ db: {} }));
vi.mock('../repositories/conversation.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn() } }));
vi.mock('../repositories/conversation-passport.repository.js', () => ({ default: { findByPassportIds: vi.fn(), findByConversationIds: vi.fn(), findPassports: vi.fn() } }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn() } }));
vi.mock('../repositories/message2.repository.js', () => ({ default: { latestByConversations: vi.fn(), getByConversation: vi.fn() } }));
import Conversations from '../repositories/conversation.repository.js';
import Members from '../repositories/conversation-passport.repository.js';
import Passports from '../repositories/passport.repository.js';
import Messages from '../repositories/message2.repository.js';
import { ConversationService } from './conversation.service.js';

beforeEach(() => vi.resetAllMocks());
it('lists only owned conversations, sorts by activity and exposes only public counterpart fields', async () => {
  vi.mocked(Members.findByPassportIds).mockResolvedValue([{ conversationId: 1 }, { conversationId: 2 }] as ConversationPassportRow[]);
  vi.mocked(Conversations.findByIds).mockResolvedValue([1, 2].map(id => ({ id, createdAt: '2030-01-01' })) as ConversationRow[]);
  vi.mocked(Members.findByConversationIds).mockResolvedValue([1, 2].map(conversationId => ({ conversationId, passportId: 20 })) as ConversationPassportRow[]);
  vi.mocked(Passports.findByIds).mockResolvedValue([{ id: 20, title: 'Teacher', image: null, description: null, email: 'private', accessToken: 'secret' }] as Passport[]);
  vi.mocked(Messages.latestByConversations).mockResolvedValue([{ conversationId: 2, text: 'Hello', createdAt: new Date('2030-02-01') }] as Message[]);
  const result = await ConversationService.getConversationList(10);
  expect(Members.findByPassportIds).toHaveBeenCalledWith([10]);
  expect(Conversations.findByIds).toHaveBeenCalledWith([1, 2]);
  expect(result.map(c => c.id)).toEqual([2, 1]);
  expect(result[0].counterpart).toEqual({ id: 20, title: 'Teacher', image: null, description: null });
  expect(JSON.stringify(result)).not.toContain('secret');
});
it('rejects history access before reading messages or counterpart data', async () => {
  vi.mocked(Conversations.findById).mockResolvedValue({ id: 1 } as ConversationRow);
  vi.mocked(Members.findPassports).mockResolvedValue([{ passportId: 20 }] as ConversationPassportRow[]);
  await expect(ConversationService.getConversationHistory(1, 99)).rejects.toMatchObject({ status: 403 });
  expect(Messages.getByConversation).not.toHaveBeenCalled();
  expect(Passports.findById).not.toHaveBeenCalled();
});
