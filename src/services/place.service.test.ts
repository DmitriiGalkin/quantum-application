import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PoolConnection } from 'mysql2/promise';
import type { CreatePlace, Place, ProjectUser, MeetUser, Meet, User } from 'entities';

const connection = vi.hoisted(() => ({}));
vi.mock('../utils/dbNext.js', () => ({
  db: { transaction: vi.fn(async (fn: (conn: PoolConnection) => Promise<unknown>) => fn(connection as PoolConnection)) },
}));
vi.mock('../repositories/place.repository.js', () => ({ default: { create: vi.fn(), update: vi.fn(), findById: vi.fn(), findAll: vi.fn() } }));
vi.mock('../repositories/place-passport.repository.js', () => ({ default: { create: vi.fn(), countTeachers: vi.fn() } }));
vi.mock('../repositories/place-schedule.repository.js', () => ({ default: { replace: vi.fn(), findByPlaceId: vi.fn() } }));
vi.mock('../repositories/project.repository.js', () => ({ default: { findIdsByPlaceId: vi.fn() } }));
vi.mock('../repositories/meet.repository.js', () => ({ default: { findByPlaceIds: vi.fn(), findIdsByPlaceId: vi.fn(), getPlaceStats: vi.fn() } }));
vi.mock('../repositories/project-user.repository.js', () => ({ default: { findByProjectIds: vi.fn() } }));
vi.mock('../repositories/meet-user.repository.js', () => ({ default: { findByMeetIds: vi.fn() } }));
vi.mock('../repositories/user.repository.js', () => ({ default: { findByIds: vi.fn() } }));
import { PlaceService } from './place.service.js';
import PlaceRepository from '../repositories/place.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import UserRepository from '../repositories/user.repository.js';

const data: CreatePlace = {
  title: 'School',
  address: 'Address',
  latitude: 55,
  longitude: 37,
  schedule: [{ weekday: 1, enabled: true, startTime: '09:00', endTime: '18:00' }],
};
beforeEach(() => vi.resetAllMocks());
describe('place persistence', () => {
  it.each([1, 50])('loads meetings for %i centres in one batch and groups them by place ID', async count => {
    const places: Place[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1, title: `School ${i + 1}`, description: null, latitude: 0, longitude: 0,
      address: '', provider: null, providerId: null, phone: null, priceFrom: null,
    }));
    const meet: Meet = {
      id: 20, projectId: 1, passportId: 10, placeId: count, price: 100, duration: 60,
      startedAt: '2030-01-01', deletedAt: null, status: 'published',
    };
    vi.mocked(PlaceRepository.findAll).mockResolvedValue(places);
    vi.mocked(MeetRepository.findByPlaceIds).mockResolvedValue([meet]);

    const result = await PlaceService.findAll();

    expect(result).toHaveLength(count);
    expect(result[count - 1].meets).toEqual([meet]);
    expect(result.slice(0, -1).every(place => place.meets.length === 0)).toBe(true);
    expect(MeetRepository.findByPlaceIds).toHaveBeenCalledExactlyOnceWith(places.map(place => place.id));
  });

  it('returns an empty list when there are no centres', async () => {
    vi.mocked(PlaceRepository.findAll).mockResolvedValue([]);
    vi.mocked(MeetRepository.findByPlaceIds).mockResolvedValue([]);
    expect(await PlaceService.findAll()).toEqual([]);
  });

  it('uses actual centre totals and counts an active student once across projects and meetings', async () => {
    vi.mocked(PlaceRepository.findById).mockResolvedValue({ id: 3 } as Place);
    vi.mocked(ProjectRepository.findIdsByPlaceId).mockResolvedValue([1, 2]);
    vi.mocked(MeetRepository.findIdsByPlaceId).mockResolvedValue([20]);
    vi.mocked(PlacePassportRepository.countTeachers).mockResolvedValue(2);
    vi.mocked(MeetRepository.getPlaceStats).mockResolvedValue({ meets: 4, pendingPlaceCount: 1 });
    const schedule = data.schedule!.map((day, index) => ({ ...day, id: index + 1, placeId: 3 }));
    vi.mocked(PlaceScheduleRepository.findByPlaceId).mockResolvedValue(schedule);
    vi.mocked(ProjectUserRepository.findByProjectIds).mockResolvedValue([{ userId: 7 }, { userId: 7 }] as ProjectUser[]);
    vi.mocked(MeetUserRepository.findByMeetIds).mockResolvedValue([{ userId: 7 }, { userId: 8 }] as MeetUser[]);
    // The user repository excludes a deleted student (8).
    vi.mocked(UserRepository.findByIds).mockResolvedValue([{ id: 7 }] as User[]);
    const result = await PlaceService.getDashboard(3);
    expect(UserRepository.findByIds).toHaveBeenCalledWith([7, 8], true);
    expect(result.stats).toEqual({ teachers: 2, projects: 2, users: 1, meets: 4, pendingPlaceCount: 1, incoming: null });
    expect(result.place.schedule).toEqual(schedule);
  });

  it('returns zeros for an empty centre instead of demo statistics', async () => {
    vi.mocked(PlaceRepository.findById).mockResolvedValue({ id: 3 } as Place);
    vi.mocked(ProjectRepository.findIdsByPlaceId).mockResolvedValue([]);
    vi.mocked(MeetRepository.findIdsByPlaceId).mockResolvedValue([]);
    vi.mocked(PlacePassportRepository.countTeachers).mockResolvedValue(0);
    vi.mocked(MeetRepository.getPlaceStats).mockResolvedValue({ meets: 0, pendingPlaceCount: 0 });
    vi.mocked(ProjectUserRepository.findByProjectIds).mockResolvedValue([]);
    vi.mocked(MeetUserRepository.findByMeetIds).mockResolvedValue([]);
    vi.mocked(UserRepository.findByIds).mockResolvedValue([]);
    expect((await PlaceService.getDashboard(3)).stats).toEqual({
      teachers: 0,
      projects: 0,
      users: 0,
      meets: 0,
      pendingPlaceCount: 0,
      incoming: null,
    });
  });

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
