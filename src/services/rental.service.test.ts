import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PoolConnection } from 'mysql2/promise';
import type { PlaceLocation, Rental } from 'entities';

vi.mock('../repositories/notification.repository.js', () => ({ NotificationRepository:{ create:vi.fn() } }));
vi.mock('../utils/dbNext.js', () => ({ db: { transaction: vi.fn(async (fn: (conn: PoolConnection) => Promise<unknown>) => fn({} as PoolConnection)) } }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { lockByIds: vi.fn() } }));
vi.mock('../repositories/place-location.repository.js', () => ({ default: { lockByIds: vi.fn(), findByIds: vi.fn() } }));
vi.mock('../repositories/place-passport.repository.js', () => ({ default: { members:vi.fn().mockResolvedValue([]), findMembership: vi.fn() } }));
vi.mock('../repositories/place-schedule.repository.js', () => ({ default: { findByPlaceId: vi.fn() } }));
vi.mock('../repositories/project.repository.js', () => ({ default: { hasProjects: vi.fn() } }));
vi.mock('../repositories/meet.repository.js', () => ({ default: { roomBusy: vi.fn() } }));
vi.mock('../repositories/rental.repository.js', () => ({ RentalRepository: { conflicts: vi.fn(), create: vi.fn(), findById: vi.fn(), setStatus: vi.fn(), busy: vi.fn() } }));

import { RentalService, rentalInterval, rentalTotal } from './rental.service.js';
import PassportRepository from '../repositories/passport.repository.js';
import PlaceLocationRepository from '../repositories/place-location.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { RentalRepository } from '../repositories/rental.repository.js';

const input = { locationId: 5, startedAt: '2099-01-05T10:00:00+03:00', endedAt: '2099-01-05T11:30:00+03:00', participants: 8, comment: 'Workshop' };
const room: PlaceLocation = { id: 5, placeId: 3, title: 'Hall', deletedAt: null, description: null, capacity: 10, hourlyRate: 199.99, rentalEnabled: true };
const pending: Rental = { ...input, id: 1, passportId: 10, placeId: 3, status: 'pending', hourlyRate: 199.99, estimatedTotal: 299.99, rejectionReason: null, createdAt: input.startedAt };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(PlaceLocationRepository.findByIds).mockResolvedValue([room]);
  vi.mocked(ProjectRepository.hasProjects).mockResolvedValue(true);
  vi.mocked(PlacePassportRepository.findMembership).mockResolvedValue({ id: 1, role: 'admin' });
  vi.mocked(PlaceScheduleRepository.findByPlaceId).mockResolvedValue(Array.from({ length: 7 }, (_, i) => ({ id: i + 1, placeId: 3, weekday: i + 1, enabled: true, startTime: '08:00', endTime: '20:00' })));
  vi.mocked(MeetRepository.roomBusy).mockResolvedValue([]);
  vi.mocked(RentalRepository.conflicts).mockResolvedValue(false);
  vi.mocked(RentalRepository.create).mockResolvedValue(1);
  vi.mocked(RentalRepository.findById).mockResolvedValue(pending);
});

describe('rental validation and access', () => {
  it('uses Moscow intervals, rejects past/invalid/overlong intervals and rounds price to kopecks', () => {
    expect(rentalInterval(input.startedAt, input.endedAt)).toBe(90);
    expect(rentalTotal(199.99, 90)).toBe(299.99);
    expect(rentalTotal(null, 90)).toBeNull();
    for (const [start, end] of [['invalid', input.endedAt], [input.startedAt, input.startedAt], ['2020-01-01T10:00:00Z', input.endedAt], [input.startedAt, '2099-01-06T11:00:00+03:00']]) expect(() => rentalInterval(start, end)).toThrow();
  });
  it('locks applicant before room and snapshots server price', async () => {
    await expect(RentalService.create(10, input)).resolves.toBe(1);
    expect(vi.mocked(PassportRepository.lockByIds).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(PlaceLocationRepository.lockByIds).mock.invocationCallOrder[0]);
    expect(RentalRepository.create).toHaveBeenCalledWith(expect.objectContaining({ hourlyRate: 199.99, estimatedTotal: 299.99, placeId: 3, passportId: 10 }), expect.anything());
  });
  it('rejects accounts without projects, capacity overflow, disabled room and closing-hour overflow', async () => {
    vi.mocked(ProjectRepository.hasProjects).mockResolvedValueOnce(false);
    await expect(RentalService.create(10, input)).rejects.toMatchObject({ status: 403 });
    await expect(RentalService.create(10, { ...input, participants: 11 })).rejects.toMatchObject({ status: 400 });
    vi.mocked(PlaceLocationRepository.findByIds).mockResolvedValueOnce([{ ...room, rentalEnabled: false }]);
    await expect(RentalService.create(10, input)).rejects.toMatchObject({ status: 400 });
    await expect(RentalService.create(10, { ...input, startedAt: '2099-01-05T19:30:00+03:00', endedAt: '2099-01-05T20:30:00+03:00' })).rejects.toMatchObject({ status: 400 });
  });
  it('rejects both meeting and confirmed rental conflicts', async () => {
    vi.mocked(MeetRepository.roomBusy).mockResolvedValueOnce([{ startedAt: input.startedAt, endedAt: input.endedAt }]);
    await expect(RentalService.create(10, input)).rejects.toMatchObject({ status: 409 });
    vi.mocked(RentalRepository.conflicts).mockResolvedValueOnce(true);
    await expect(RentalService.changeStatus(1, 30, 'confirmed', null, 3)).rejects.toMatchObject({ status: 409 });
    expect(RentalRepository.setStatus).not.toHaveBeenCalled();
  });
  it('requires this centre admin, applicant ownership and a rejection reason', async () => {
    await expect(RentalService.changeStatus(1, 30, 'confirmed', null, 4)).rejects.toMatchObject({ status: 403 });
    vi.mocked(PlacePassportRepository.findMembership).mockResolvedValueOnce({ id: 1, role: 'teacher' });
    await expect(RentalService.changeStatus(1, 30, 'confirmed', null, 3)).rejects.toMatchObject({ status: 403 });
    await expect(RentalService.changeStatus(1, 99, 'cancelled', null)).rejects.toMatchObject({ status: 403 });
    await expect(RentalService.changeStatus(1, 30, 'rejected', ' ', 3)).rejects.toMatchObject({ status: 400 });
    await RentalService.changeStatus(1, 30, 'rejected', ' No space ', 3);
    expect(RentalRepository.setStatus).toHaveBeenCalledWith(1, 'rejected', 'No space', expect.anything());
  });
  it('allows applicant cancellation of confirmed rentals and prevents reopening terminal states', async () => {
    vi.mocked(RentalRepository.findById).mockResolvedValue({ ...pending, status: 'confirmed' });
    await RentalService.changeStatus(1, 10, 'cancelled', 'Изменились планы');
    expect(RentalRepository.setStatus).toHaveBeenCalledWith(1, 'cancelled', 'Изменились планы', expect.anything());
    vi.mocked(RentalRepository.findById).mockResolvedValue({ ...pending, status: 'cancelled' });
    await expect(RentalService.changeStatus(1, 30, 'confirmed', null, 3)).rejects.toMatchObject({ status: 409 });
  });
  it('returns only busy intervals and rejects nonexistent calendar days', async () => {
    vi.mocked(RentalRepository.busy).mockResolvedValue([{ startedAt: input.startedAt, endedAt: input.endedAt }]);
    expect(await RentalService.busy(5, '2099-01-05')).toEqual([{ startedAt: input.startedAt, endedAt: input.endedAt }]);
    await expect(RentalService.busy(5, '2099-02-30')).rejects.toMatchObject({ status: 400 });
  });
});
