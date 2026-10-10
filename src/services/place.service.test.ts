import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PoolConnection } from 'mysql2/promise';
import type { CreatePlace } from 'entities';

const connection = vi.hoisted(() => ({}));
vi.mock('../utils/dbNext.js', () => ({ db: { transaction: vi.fn(async (fn: (conn: PoolConnection) => Promise<unknown>) => fn(connection as PoolConnection)) } }));
vi.mock('../repositories/place.repository.js', () => ({ default: { create: vi.fn(), update: vi.fn(), findById: vi.fn() } }));
vi.mock('../repositories/place-passport.repository.js', () => ({ default: { create: vi.fn() } }));
vi.mock('../repositories/place-schedule.repository.js', () => ({ default: { replace: vi.fn() } }));
import { PlaceService } from './place.service.js';
import PlaceRepository from '../repositories/place.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';

const data: CreatePlace = { title: 'School', address: 'Address', latitude: 55, longitude: 37, schedule: [{ weekday: 1, enabled: true, startTime: '09:00', endTime: '18:00' }] };
beforeEach(() => vi.resetAllMocks());
describe('place persistence', () => {
  it('creates a centre, administrator and schedule with the same transaction connection', async () => {
    vi.mocked(PlaceRepository.create).mockResolvedValue(3);
    expect(await PlaceService.create(10, data)).toBe(3);
    expect(PlaceRepository.create).toHaveBeenCalledWith(data, connection);
    expect(PlacePassportRepository.create).toHaveBeenCalledWith({ placeId: 3, passportId: 10, role: 'admin' }, connection);
    expect(PlaceScheduleRepository.replace).toHaveBeenCalledWith(3, data.schedule, connection);
  });

  it('propagates a failed administrator write so the transaction is rolled back', async () => {
    vi.mocked(PlaceRepository.create).mockResolvedValue(3);
    vi.mocked(PlacePassportRepository.create).mockRejectedValue(new Error('Write failed'));
    await expect(PlaceService.create(10, data)).rejects.toThrow('Write failed');
    expect(PlaceScheduleRepository.replace).not.toHaveBeenCalled();
  });
});
