import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FindAllIdeaInput } from 'entities';
vi.mock('../utils/dbNext.js', () => ({ db: { query: vi.fn() } }));
import { db } from '../utils/dbNext.js';
import IdeaRepository from './idea.repository.js';

beforeEach(() => { vi.resetAllMocks(); vi.mocked(db.query).mockResolvedValue([]); });
describe('stable idea ordering', () => {
  it.each([
    [undefined, 'idea.createdAt DESC, idea.id DESC'],
    [{ sort: 'new' }, 'idea.createdAt DESC, idea.id DESC'],
    [{ sort: 'popular' }, 'idea.userCount DESC, idea.createdAt DESC, idea.id DESC'],
    [{ sort: 'nearby' }, 'idea.createdAt DESC, idea.id DESC'],
    [{ sort: 'nearby', latitude: 55.75 }, 'idea.createdAt DESC, idea.id DESC'],
    [{ sort: 'nearby', latitude: 55.75, longitude: 37.62 }, 'distance IS NULL, distance ASC, idea.createdAt DESC, idea.id DESC'],
  ] as [FindAllIdeaInput | undefined, string][])('adds deterministic ties for %j', async (params, order) => {
    await IdeaRepository.findAll(params);
    const [sql, values] = vi.mocked(db.query).mock.calls[0];
    expect(sql).toContain(`ORDER BY ${order}`);
    if (params?.longitude !== undefined) expect(values).toEqual([55.75, 37.62, 55.75]);
    else { expect(sql).not.toContain(' AS distance'); expect(values).toEqual([]); }
  });
});
