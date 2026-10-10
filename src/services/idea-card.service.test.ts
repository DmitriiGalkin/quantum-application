import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PoolConnection } from 'mysql2/promise';
import type { IdeaCardRow } from '../entities/idea-card.js';

vi.mock('../utils/dbNext.js', () => ({ db: { transaction: async (fn: (conn: PoolConnection) => Promise<unknown>) => fn({} as PoolConnection) } }));
vi.mock('../repositories/idea-card.repository.js', () => ({ IdeaCardRepository: {
  findById: vi.fn(), create: vi.fn(), update: vi.fn(),
} }));
vi.mock('../repositories/idea-photo.repository.js', () => ({ IdeaPhotoRepository: { replace: vi.fn() } }));
import { IdeaCardService } from './idea-card.service.js';
import { IdeaCardRepository } from '../repositories/idea-card.repository.js';
import { IdeaPhotoRepository } from '../repositories/idea-photo.repository.js';

const card = { id: 'toy-test', name: 'Test', description: '', photos: [] };
beforeEach(() => { vi.clearAllMocks(); });

describe('idea card ownership and identity', () => {
  it('rejects updates and imports by another owner before persisting data', async () => {
    vi.mocked(IdeaCardRepository.findById).mockResolvedValue({ id: 1, passportId: 10 } as IdeaCardRow);
    await expect(IdeaCardService.write(card, 20, 'update', card.id)).rejects.toMatchObject({ status: 403 });
    await expect(IdeaCardService.import({ schemaVersion: 1, items: [card] }, 20)).rejects.toMatchObject({ status: 403 });
    expect(IdeaCardRepository.update).not.toHaveBeenCalled();
    expect(IdeaPhotoRepository.replace).not.toHaveBeenCalled();
  });
  it('rejects a changed ID, duplicate creation and missing update', async () => {
    await expect(IdeaCardService.write(card, 10, 'update', 'different')).rejects.toMatchObject({ status: 400 });
    expect(IdeaCardRepository.findById).not.toHaveBeenCalled();
    vi.mocked(IdeaCardRepository.findById).mockResolvedValue({ id: 1, passportId: 10 } as IdeaCardRow);
    await expect(IdeaCardService.write(card, 10, 'create')).rejects.toMatchObject({ status: 409 });
    vi.mocked(IdeaCardRepository.findById).mockResolvedValue(null);
    await expect(IdeaCardService.write(card, 10, 'update', card.id)).rejects.toMatchObject({ status: 404 });
    expect(IdeaCardRepository.create).not.toHaveBeenCalled();
  });
});
