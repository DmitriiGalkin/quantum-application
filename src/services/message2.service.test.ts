import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message2Row } from 'entities';

vi.mock('./conversation.service.js', () => ({ ConversationService: { requireParticipant: vi.fn() } }));
vi.mock('../repositories/message2.repository.js', () => ({ default: { create: vi.fn(), findById: vi.fn(), update: vi.fn(), delete: vi.fn() } }));
import { Message2Service } from './message2.service.js';
import { ConversationService } from './conversation.service.js';
import Message2Repository from '../repositories/message2.repository.js';

beforeEach(() => vi.resetAllMocks());
describe('message access', () => {
  it('does not send a message to a conversation the author cannot access', async () => {
    vi.mocked(ConversationService.requireParticipant).mockRejectedValueOnce(new Error('No access'));
    await expect(Message2Service.create(1, 10, { content: 'Hello' })).rejects.toThrow('No access');
    expect(Message2Repository.create).not.toHaveBeenCalled();
  });

  it.each(['update', 'delete'] as const)('rejects another author’s message %s', async operation => {
    vi.mocked(Message2Repository.findById).mockResolvedValue({ senderPassportId: 10, conversationId: 1 } as Message2Row);
    const promise = operation === 'update' ? Message2Service.update(1, { content: 'Changed' }, 99) : Message2Service.delete(1, 99);
    await expect(promise).rejects.toMatchObject({ status: 403 });
    expect(Message2Repository[operation]).not.toHaveBeenCalled();
  });
});
