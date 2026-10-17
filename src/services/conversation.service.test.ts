import { beforeEach, expect, it, vi } from 'vitest';
import type { ConversationPassportRow, ConversationRow, Message, Passport } from 'entities';
import type { PoolConnection } from 'mysql2/promise';
const connection = vi.hoisted(() => ({}));
vi.mock('../utils/dbNext.js', () => ({ db: { transaction: vi.fn(async (fn: (conn: PoolConnection) => Promise<unknown>) => fn(connection as PoolConnection)) } }));
vi.mock('../repositories/conversation.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn(), create: vi.fn() } }));
vi.mock('../repositories/conversation-passport.repository.js', () => ({ default: { acknowledge:vi.fn(), findByPassportIds: vi.fn(), findByConversationIds: vi.fn(), findPassports: vi.fn() } }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn(), lockByIds: vi.fn() } }));
vi.mock('../repositories/message2.repository.js', () => ({ default: { findById:vi.fn(), unread: vi.fn().mockResolvedValue(0), latestByConversations: vi.fn(), getByConversation: vi.fn() } }));
import Conversations from '../repositories/conversation.repository.js';
import Members from '../repositories/conversation-passport.repository.js';
import Passports from '../repositories/passport.repository.js';
import Messages from '../repositories/message2.repository.js';
import { ConversationService } from './conversation.service.js';

beforeEach(() => vi.resetAllMocks());
it('rejects a read receipt for a message belonging to a different conversation',async()=>{
  vi.mocked(Members.findPassports).mockResolvedValue([{passportId:10}] as ConversationPassportRow[]);
  vi.mocked(Messages.findById).mockResolvedValue({id:5,conversationId:99} as Awaited<ReturnType<typeof Messages.findById>>);
  await expect(ConversationService.acknowledge(1,10,5,true)).rejects.toMatchObject({status:400});
  expect(Members.acknowledge).not.toHaveBeenCalled();
});
it('returns the existing parent/teacher direct chat after locking the same pair, without messages or another chat', async () => {
  vi.mocked(Passports.findById).mockResolvedValue({ id: 80 } as Passport);
  vi.mocked(Members.findByPassportIds).mockResolvedValue([{ conversationId: 3, passportId: 42 }, { conversationId: 3, passportId: 80 }] as ConversationPassportRow[]);
  vi.mocked(Conversations.findByIds).mockResolvedValue([{ id: 3, createdAt: '2026-10-01' }] as ConversationRow[]);
  for (let i = 0; i < 2; i++) {
    expect(await ConversationService.startConversation({ passportId: 42, targetPassportId: 80 })).toMatchObject({ exists: true, conversation: { id: 3 } });
  }
  expect(Passports.lockByIds).toHaveBeenCalledWith([42, 80], connection);
  expect(Conversations.create).not.toHaveBeenCalled();
});
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
