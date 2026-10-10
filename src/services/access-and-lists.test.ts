import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Meet, Passport, Place, Project, ProjectUser, User } from 'entities';

vi.mock('../utils/dbNext.js', () => ({ db: {} }));
vi.mock('../repositories/project.repository.js', () => ({ default: { findAll: vi.fn(), findById: vi.fn(), update: vi.fn() } }));
vi.mock('../repositories/meet.repository.js', () => ({ default: { findById: vi.fn(), findByProjectIds: vi.fn(), findByProjectId: vi.fn(), update: vi.fn(), updateStatus: vi.fn() } }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn() } }));
vi.mock('../repositories/place.repository.js', () => ({ default: { findByIds: vi.fn(), findById: vi.fn() } }));
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
import UserRepository from '../repositories/user.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { IdeaService } from './idea.service.js';

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
    expect(ProjectRepository.update).toHaveBeenCalledWith(1, { title: 'Changed', description: '', image: '', placeId: 3, ideaId: undefined });
  });
});

describe('list composition', () => {
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
