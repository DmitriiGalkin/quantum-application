import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Meet } from 'entities';

vi.mock('../utils/dbNext.js', () => ({ db: { query: vi.fn() } }));
import { db } from '../utils/dbNext.js';
import MeetRepository from './meet.repository.js';

beforeEach(() => vi.resetAllMocks());

describe('meetings for multiple centres', () => {
  it('skips SQL for an empty centre list', async () => {
    expect(await MeetRepository.findByPlaceIds([])).toEqual([]);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('binds unique centre IDs and preserves past and deleted meetings in the existing centre list', async () => {
    const row: Meet = {
      id: 1, projectId: 2, passportId: 3, placeId: 4, price: null, duration: null,
      startedAt: '2020-01-01', deletedAt: '2020-01-02', status: 'cancelled',
    };
    vi.mocked(db.query).mockResolvedValue([row]);
    expect(await MeetRepository.findByPlaceIds([4, 5, 4])).toEqual([row]);
    expect(db.query).toHaveBeenCalledExactlyOnceWith('SELECT * FROM meet WHERE placeId IN (?)', [[4, 5]]);
  });
});
