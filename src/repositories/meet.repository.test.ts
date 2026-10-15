import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Meet } from 'entities';

vi.mock('../utils/dbNext.js', () => ({ db: { query: vi.fn() } }));
import { db } from '../utils/dbNext.js';
import MeetRepository from './meet.repository.js';

beforeEach(() => vi.resetAllMocks());

it('selects only published nondeleted meetings at the actual centre, including past dates', async () => {
  vi.mocked(db.query).mockResolvedValue([]);
  await MeetRepository.findPublishedByPlaceId(597);
  expect(db.query).toHaveBeenCalledExactlyOnceWith("SELECT * FROM meet WHERE placeId = ? AND status = 'published' AND deletedAt IS NULL ORDER BY startedAt", [597]);
});

describe('meetings for multiple centres', () => {
  it('skips SQL for an empty centre list', async () => {
    expect(await MeetRepository.findByPlaceIds([])).toEqual([]);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('binds unique centre IDs and preserves past and deleted meetings in the existing centre list', async () => {
    const row: Meet = {
      id: 1, projectId: 2, passportId: 3, placeId: 4, price: null, duration: null,
      startedAt: '2020-01-01T00:00:00.000Z', deletedAt: '2020-01-02', status: 'cancelled', locationId: null, maxParticipants: null,
    };
    vi.mocked(db.query).mockResolvedValue([row]);
    expect(await MeetRepository.findByPlaceIds([4, 5, 4])).toEqual([row]);
    expect(db.query).toHaveBeenCalledExactlyOnceWith('SELECT * FROM meet WHERE placeId IN (?)', [[4, 5]]);
  });
});
