import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Idea, Meet, Passport, Place, Project, ProjectUser, User } from 'entities';

vi.mock('../utils/dbNext.js', () => ({ db: {} }));
vi.mock('../repositories/project.repository.js', () => ({ default: { findAll: vi.fn(), findById: vi.fn(), update: vi.fn() } }));
vi.mock('../repositories/meet.repository.js', () => ({ default: { findAll: vi.fn(), findById: vi.fn(), findByProjectIds: vi.fn(), findByProjectId: vi.fn(), update: vi.fn(), updateStatus: vi.fn() } }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn() } }));
vi.mock('../repositories/place.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn(), findByPassportId: vi.fn() } }));
vi.mock('../repositories/place-location.repository.js', () => ({ default: { findByIds: vi.fn() } }));
vi.mock('../repositories/idea.repository.js', () => ({ default: { findByTeacherId: vi.fn() } }));
vi.mock('../repositories/user.repository.js', () => ({ default: { findByIds: vi.fn(), findByProjectId: vi.fn() } }));
vi.mock('../repositories/project-user.repository.js', () => ({ default: { findByProjectIds: vi.fn(), findByProjectId: vi.fn() } }));
vi.mock('../repositories/meet-user.repository.js', () => ({ default: { findByMeetIds: vi.fn() } }));
vi.mock('../repositories/place-passport.repository.js', () => ({ default: { findMembership: vi.fn() } }));
vi.mock('../repositories/payment.repository.js', () => ({ default: { findPaidMeetIdsByUser: vi.fn() } }));
vi.mock('./idea.service.js', () => ({ IdeaService: { findByIds: vi.fn() } }));

import { ProjectService } from './project.service.js';
import { MeetService } from './meet.service.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import PlaceLocationRepository from '../repositories/place-location.repository.js';
import UserRepository from '../repositories/user.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { IdeaService } from './idea.service.js';
import { TeacherService } from './teacher.service.js';
import IdeaRepository from '../repositories/idea.repository.js';

const passport: Passport = { id: 10, title: 'Teacher', provider: 'test', providerId: '10', accessToken: '', description: null, image: null, email: '' };
const place: Place = { id: 3, title: 'School', description: null, latitude: 0, longitude: 0, address: '', provider: null, providerId: null, phone: null, priceFrom: null };
const project: Project = { id: 1, passportId: 10, placeId: 3, ideaId: null, title: 'Project', description: '', image: null };
const meet: Meet = { id: 20, projectId: 1, passportId: 10, placeId: 3, price: 100, duration: 60, startedAt: '2030-01-01T10:00:00', deletedAt: null, status: 'published' };
const users: User[] = [1, 2].map(id => ({ id, passportId: 7, title: `User ${id}`, description: '', age: null, image: null }));
const joins: ProjectUser[] = users.map(user => ({ id: user.id, userId: user.id, projectId: 1, createdAt: '2030-01-01' }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(PassportRepository.findByIds).mockResolvedValue([passport]);
  vi.mocked(PlaceRepository.findByIds).mockResolvedValue([place]);
  vi.mocked(PlaceRepository.findById).mockResolvedValue(place);
  vi.mocked(PlaceLocationRepository.findByIds).mockResolvedValue([]);
  vi.mocked(UserRepository.findByIds).mockResolvedValue(users);
  vi.mocked(ProjectUserRepository.findByProjectIds).mockResolvedValue(joins);
  vi.mocked(MeetUserRepository.findByMeetIds).mockResolvedValue([]);
  vi.mocked(IdeaService.findByIds).mockResolvedValue([]);
});

describe('ownership checks', () => {
  it('returns a meeting to approval when only its duration changes', async () => {
    vi.mocked(MeetRepository.findById).mockResolvedValue({ ...meet, duration: 60, status: 'published' });
    await MeetService.update({ id: meet.id, duration: 90 }, meet.passportId);
    expect(MeetRepository.update).toHaveBeenCalledWith(meet.id, expect.objectContaining({ duration: 90, status: 'pending' }));
  });

  it('rejects changes to another teacher’s project before writing', async () => {
    vi.mocked(ProjectRepository.findById).mockResolvedValue(project);
    await expect(ProjectService.update(1, { title: 'Changed', description: '', image: '', placeId: 3 }, 99)).rejects.toMatchObject({ status: 403 });
    expect(ProjectRepository.update).not.toHaveBeenCalled();
  });

  it('rejects changes to another teacher’s meeting before writing', async () => {
    vi.mocked(MeetRepository.findById).mockResolvedValue(meet);
    await expect(MeetService.update({ id: 20, price: 1 }, 99)).rejects.toMatchObject({ status: 403 });
    expect(MeetRepository.update).not.toHaveBeenCalled();
  });

  it('allows the centre administrator to approve a meeting, but rejects an unrelated teacher', async () => {
    vi.mocked(MeetRepository.findById).mockResolvedValue(meet);
    vi.mocked(PlacePassportRepository.findMembership).mockResolvedValueOnce({ id: 1, role: 'admin' }).mockResolvedValueOnce({ id: 2, role: 'teacher' });
    await MeetService.updateStatus(20, 'published', 99);
    expect(MeetRepository.updateStatus).toHaveBeenCalledWith(20, 'published');
    await expect(MeetService.updateStatus(20, 'cancelled', 98)).rejects.toMatchObject({ status: 403 });
    expect(MeetRepository.updateStatus).toHaveBeenCalledTimes(1);
  });

  it('ignores service fields supplied with a project update', async () => {
    vi.mocked(ProjectRepository.findById).mockResolvedValue(project);
    await ProjectService.update(1, { title: 'Changed', description: '', image: '', placeId: 3, passportId: 99 } as Parameters<typeof ProjectService.update>[1], 10);
    expect(ProjectRepository.update).toHaveBeenCalledWith(1, { title: 'Changed', description: '', image: '', placeId: 3, locationId: null, ideaId: undefined });
  });

  it('preserves a selected hall on an older client update and supports clearing it', async () => {
    vi.mocked(ProjectRepository.findById).mockResolvedValue({ ...project, locationId: 5 });
    vi.mocked(PlaceLocationRepository.findByIds).mockResolvedValue([{ id: 5, title: 'Workshop', placeId: 3, deletedAt: null }]);
    const data = { title: 'Changed', description: '', image: '', placeId: 3 };
    await ProjectService.update(1, data, 10);
    expect(ProjectRepository.update).toHaveBeenLastCalledWith(1, expect.objectContaining({ locationId: 5 }));
    await ProjectService.update(1, { ...data, locationId: null }, 10);
    expect(ProjectRepository.update).toHaveBeenLastCalledWith(1, expect.objectContaining({ locationId: null }));
  });

  it('clears the hall when changing centers and rejects assigning a hall from another center', async () => {
    vi.mocked(ProjectRepository.findById).mockResolvedValue({ ...project, locationId: 5 });
    vi.mocked(PlaceRepository.findById).mockResolvedValue({ ...place, id: 4 });
    vi.mocked(PlaceLocationRepository.findByIds).mockResolvedValue([{ id: 5, title: 'Workshop', placeId: 3, deletedAt: null }]);
    const data = { title: 'Changed', description: '', image: '', placeId: 4 };
    await ProjectService.update(1, data, 10);
    expect(ProjectRepository.update).toHaveBeenCalledExactlyOnceWith(1, expect.objectContaining({ placeId: 4, locationId: null }));
    await expect(ProjectService.update(1, { ...data, locationId: 5 }, 10)).rejects.toMatchObject({ status: 400 });
    expect(ProjectRepository.update).toHaveBeenCalledTimes(1);
  });
});

describe('list composition', () => {
  it.each([1, 50])('loads a teacher dashboard with %i projects without repeating meeting queries', async count => {
    vi.mocked(ProjectRepository.findAll).mockResolvedValue(Array.from({ length: count }, (_, i) => ({ ...project, id: i + 1 })));
    vi.mocked(MeetRepository.findAll).mockResolvedValue([meet]);
    vi.mocked(ProjectUserRepository.findByProjectIds).mockResolvedValue([
      ...joins,
      { ...joins[0], id: 3, projectId: count },
    ]);

    const result = await TeacherService.getDashboard(passport.id);

    expect(result).toMatchObject({ projects: count, meets: 1, students: 2, debit: null });
    expect(result.bmeets).toHaveLength(1);
    expect(MeetRepository.findAll).toHaveBeenCalledExactlyOnceWith({ passportId: passport.id });
    expect(ProjectUserRepository.findByProjectIds).toHaveBeenCalledTimes(2);
    expect(UserRepository.findByIds).toHaveBeenCalledTimes(2);
    expect(UserRepository.findByProjectId).not.toHaveBeenCalled();
  });

  it('returns zero counts and no income for an empty teacher dashboard', async () => {
    vi.mocked(ProjectRepository.findAll).mockResolvedValue([]);
    vi.mocked(MeetRepository.findAll).mockResolvedValue([]);
    vi.mocked(ProjectUserRepository.findByProjectIds).mockResolvedValue([]);
    const result = await TeacherService.getDashboard(passport.id);
    expect(result).toEqual({ projects: 0, meets: 0, students: 0, debit: null, bmeets: [] });
  });

  it.each([1, 50])('assembles a teacher profile with %i projects using batches and matches related records by ID', async count => {
    const projects = Array.from({ length: count }, (_, i) => ({ ...project, id: i + 1 }));
    const idea: Idea = {
      id: 9, userId: users[0].id, passportId: null, title: 'Idea', description: '', image: null,
      userCount: 0, createdAt: '2030-01-01', isLiked: 0, today: false, photos: [],
    };
    vi.mocked(PassportRepository.findById).mockResolvedValue(passport);
    vi.mocked(ProjectRepository.findAll).mockResolvedValue(projects);
    vi.mocked(IdeaRepository.findByTeacherId).mockResolvedValue([idea, { ...idea, id: 10, userId: 999 }]);
    vi.mocked(PlaceRepository.findByPassportId).mockResolvedValue([place]);
    vi.mocked(MeetRepository.findByProjectIds).mockResolvedValue([{ ...meet, projectId: count }]);
    vi.mocked(UserRepository.findByIds).mockResolvedValue([...users].reverse());

    const result = await TeacherService.findById(passport.id);

    expect(result).toMatchObject({ students: 2, meets: 1, centersCount: 1 });
    expect(result?.projects).toHaveLength(count);
    expect(result?.projects[count - 1].meets[0].id).toBe(meet.id);
    expect(result?.ideas.map(item => item.user?.id ?? null)).toEqual([users[0].id, null]);
    expect(result?.projects[0].users.map(user => user.id)).toEqual([1, 2]);
    expect(MeetRepository.findByProjectIds).toHaveBeenCalledExactlyOnceWith(projects.map(project => project.id), true);
    expect(PlaceRepository.findByIds).toHaveBeenCalledTimes(2);
    expect(UserRepository.findByIds).toHaveBeenCalledTimes(3);
    expect(UserRepository.findByProjectId).not.toHaveBeenCalled();
    expect(MeetRepository.findAll).not.toHaveBeenCalled();
  });

  it('does not load a profile for a missing teacher', async () => {
    vi.mocked(PassportRepository.findById).mockResolvedValue(null);
    expect(await TeacherService.findById(999)).toBeNull();
    expect(ProjectRepository.findAll).not.toHaveBeenCalled();
  });

  it.each([1, 50])('loads %i projects with the same number of repository calls', async count => {
    const projects = Array.from({ length: count }, (_, i) => ({ ...project, id: i + 1 }));
    vi.mocked(ProjectRepository.findAll).mockResolvedValue(projects);
    vi.mocked(MeetRepository.findByProjectIds).mockResolvedValue([meet]);
    const result = await ProjectService.findAll({});
    expect(result).toHaveLength(count);
    expect(result[0]).toMatchObject({ users, meets: [{ id: 20, capacity: 2 }] });
    expect(result.slice(1).every(project => project.meets.length === 0)).toBe(true);
    expect(ProjectRepository.findAll).toHaveBeenCalledOnce();
    expect(MeetRepository.findByProjectIds).toHaveBeenCalledOnce();
    expect(ProjectUserRepository.findByProjectIds).toHaveBeenCalledTimes(2);
    expect(UserRepository.findByIds).toHaveBeenCalledTimes(2);
    expect(PlaceRepository.findByIds).toHaveBeenCalledTimes(2);
    expect(PassportRepository.findByIds).toHaveBeenCalledTimes(2);
  });

  it('matches feed participants by user ID when their arrays have different ordering', async () => {
    vi.mocked(ProjectRepository.findById).mockResolvedValue(project);
    vi.mocked(PassportRepository.findById).mockResolvedValue(passport);
    vi.mocked(PlaceRepository.findById).mockResolvedValue(place);
    vi.mocked(UserRepository.findByProjectId).mockResolvedValue([...users].reverse());
    vi.mocked(MeetRepository.findByProjectId).mockResolvedValue([]);
    vi.mocked(ProjectUserRepository.findByProjectId).mockResolvedValue(joins);
    const result = await ProjectService.findById(1);
    expect(result.feeds?.filter(item => item.type === 'join').map(item => [item.id, item.user?.id])).toEqual([['join1', 1], ['join2', 2]]);
  });
});
