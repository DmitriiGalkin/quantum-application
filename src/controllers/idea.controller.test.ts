import { describe, expect, it, vi } from 'vitest';
import type { RequestWithPassport, TypedResponse } from './helper.js';
import type { IdeaDto } from '../entities/idea.js';

vi.mock('../services/idea.service.js', () => ({ IdeaService: { create: vi.fn(), update: vi.fn(), importCatalog: vi.fn() } }));
import controller from './idea.controller.js';
import { IdeaService } from '../services/idea.service.js';

describe('idea card authorization', () => {
  it('rejects every anonymous write before invoking the service', async () => {
    const req = { body: {}, params: {} } as RequestWithPassport<unknown, unknown>;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await controller.create(req, res as unknown as TypedResponse<number>);
    await controller.update(req, res as unknown as TypedResponse<IdeaDto>);
    await controller.importCatalog(req, res as unknown as TypedResponse<{ ideas: number; photos: number }>);
    expect(res.status.mock.calls).toEqual([[401], [401], [401]]);
    expect(IdeaService.create).not.toHaveBeenCalled();
    expect(IdeaService.importCatalog).not.toHaveBeenCalled();
  });
});
