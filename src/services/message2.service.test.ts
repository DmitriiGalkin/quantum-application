import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message2Row } from 'entities';

vi.mock('./conversation.service.js', () => ({ ConversationService: { requireParticipant: vi.fn() } }));
vi.mock('../utils/dbNext.js', () => ({ db: { transaction: vi.fn(async (run: (conn: object) => unknown) => run({})) } }));
vi.mock('../repositories/conversation.repository.js', () => ({ default: { lockById: vi.fn() } }));
vi.mock('../repositories/conversation-passport.repository.js', () => ({ default: { findPassports: vi.fn() } }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { findById: vi.fn() } }));
vi.mock('./notification.service.js', () => ({ NotificationService: { notify: vi.fn() } }));
vi.mock('../repositories/message2.repository.js', () => ({ default: { create: vi.fn(), countByConversation: vi.fn(), findById: vi.fn(), update: vi.fn(), delete: vi.fn() } }));
import { Message2Service } from './message2.service.js';
import { ConversationService } from './conversation.service.js';
import Message2Repository from '../repositories/message2.repository.js';
import ConversationPassportRepository from '../repositories/conversation-passport.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import { NotificationService } from './notification.service.js';

beforeEach(() => vi.resetAllMocks());
describe('message access', () => {
  it('does not send a message to a conversation the author cannot access', async () => {
    vi.mocked(ConversationService.requireParticipant).mockRejectedValueOnce(new Error('No access'));
    await expect(Message2Service.create(1, 10, { content: 'Hello' })).rejects.toThrow('No access');
    expect(Message2Repository.create).not.toHaveBeenCalled();
  });

  it('notifies the other participant only for the first message', async () => {
    vi.mocked(Message2Repository.countByConversation).mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    vi.mocked(Message2Repository.create).mockResolvedValue({ id: 7, conversationId: 1, senderPassportId: 10, text: 'Здравствуйте', createdAt: new Date(), updatedAt: new Date() });
    vi.mocked(ConversationPassportRepository.findPassports).mockResolvedValue([
      { passportId: 10, isMuted: false }, { passportId: 20, isMuted: false },
    ] as Awaited<ReturnType<typeof ConversationPassportRepository.findPassports>>);
    vi.mocked(PassportRepository.findById).mockResolvedValue({ id: 10, title: 'Учитель' } as Awaited<ReturnType<typeof PassportRepository.findById>>);
    await Message2Service.create(1, 10, { content: 'Здравствуйте' });
    await Message2Service.create(1, 10, { content: 'Ещё одно сообщение' });
    expect(NotificationService.notify).toHaveBeenCalledOnce();
    expect(NotificationService.notify).toHaveBeenCalledWith([20], 'chat-1-started', 'Новый чат', 'Первое сообщение от Учитель.', '/chats/1', expect.anything());
  });

  it.each(['update', 'delete'] as const)('rejects another author’s message %s', async operation => {
    vi.mocked(Message2Repository.findById).mockResolvedValue({ senderPassportId: 10, conversationId: 1 } as Message2Row);
    const promise = operation === 'update' ? Message2Service.update(1, { content: 'Changed' }, 99) : Message2Service.delete(1, 99);
    await expect(promise).rejects.toMatchObject({ status: 403 });
    expect(Message2Repository[operation]).not.toHaveBeenCalled();
  });
});
