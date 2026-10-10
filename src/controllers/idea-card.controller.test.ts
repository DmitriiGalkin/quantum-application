import { describe, expect, it, vi } from 'vitest';
import type { RequestWithPassport, TypedResponse } from './helper.js';
import type { IdeaCard } from '../entities/idea-card.js';

vi.mock('../services/idea-card.service.js', () => ({ IdeaCardService: { write: vi.fn(), import: vi.fn() } }));
import controller from './idea-card.controller.js';
import { IdeaCardService } from '../services/idea-card.service.js';

describe('idea card authorization', () => {
  it('rejects every anonymous write before invoking the service', async () => {
    const req = { body: {}, params: {} } as RequestWithPassport<unknown, unknown>;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await controller.create(req, res as unknown as TypedResponse<IdeaCard>);
    await controller.update(req, res as unknown as TypedResponse<IdeaCard>);
    await controller.importCatalog(req, res as unknown as TypedResponse<{ ideas: number; photos: number }>);
    expect(res.status.mock.calls).toEqual([[401], [401], [401]]);
    expect(IdeaCardService.write).not.toHaveBeenCalled();
    expect(IdeaCardService.import).not.toHaveBeenCalled();
  });
});
