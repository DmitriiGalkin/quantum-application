import { beforeEach, expect, it, vi } from 'vitest';
import type { Idea, Meet, MeetUser, Project, ProjectUser, TeacherUser, User } from 'entities';
vi.mock('../repositories/user.repository.js', () => ({ default: { findByIds: vi.fn() } }));
vi.mock('../repositories/teacher-user.repository.js', () => ({ default: { findByTeacherId: vi.fn() } }));
vi.mock('../repositories/project.repository.js', () => ({ default: { findAll: vi.fn(), findByIdeaIds: vi.fn() } }));
vi.mock('../repositories/meet.repository.js', () => ({ default: { findPublishedByPlaceId: vi.fn(), findActiveByTeacherId: vi.fn(), findByProjectIds: vi.fn() } }));
vi.mock('../repositories/project-user.repository.js', () => ({ default: { findByProjectIds: vi.fn() } }));
vi.mock('../repositories/meet-user.repository.js', () => ({ default: { findByMeetIds: vi.fn() } }));
vi.mock('../repositories/idea.repository.js', () => ({ default: { findByUserIds: vi.fn() } }));
vi.mock('./placeTeacher.service.js', () => ({ default: { requireAdmin: vi.fn() } }));
vi.mock('./conversation.service.js', () => ({ ConversationService: { startConversation: vi.fn() } }));
import UserRepository from '../repositories/user.repository.js';
import TeacherUserRepository from '../repositories/teacher-user.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import PlaceTeacherService from './placeTeacher.service.js';
import { ConversationService } from './conversation.service.js';
import { StudentAccessService } from './student-access.service.js';
import { TeacherIdeaService } from './teacher-idea.service.js';

const child = { id: 7, passportId: 80, title: 'Ученик', age: 9, image: '/real.jpg', description: '' } satisfies User;
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(TeacherUserRepository.findByTeacherId).mockResolvedValue([]);
  vi.mocked(ProjectRepository.findAll).mockResolvedValue([]);
  vi.mocked(MeetRepository.findActiveByTeacherId).mockResolvedValue([]);
  vi.mocked(MeetRepository.findPublishedByPlaceId).mockResolvedValue([]);
  vi.mocked(ProjectUserRepository.findByProjectIds).mockResolvedValue([]);
  vi.mocked(MeetUserRepository.findByMeetIds).mockResolvedValue([]);
  vi.mocked(UserRepository.findByIds).mockImplementation(async ids => ids.includes(7) ? [child] : []);
});

it('uses past and future meeting signups once, asks for active profiles and returns only public fields', async () => {
  vi.mocked(MeetRepository.findPublishedByPlaceId).mockResolvedValue([{ id: 1 }, { id: 2 }] as Meet[]);
  vi.mocked(MeetUserRepository.findByMeetIds).mockResolvedValue([{ userId: 7 }, { userId: 7 }, { userId: 8 }] as MeetUser[]);
  const result = await StudentAccessService.forPlace(597);
  expect(MeetRepository.findPublishedByPlaceId).toHaveBeenCalledWith(597);
  expect(MeetUserRepository.findByMeetIds).toHaveBeenCalledWith([1, 2]);
  expect(UserRepository.findByIds).toHaveBeenCalledWith([7, 8], true);
  expect(result).toEqual([{ id: 7, title: 'Ученик', age: 9, image: '/real.jpg', description: '' }]);
  expect(ProjectRepository.findAll).not.toHaveBeenCalled();
  expect(TeacherUserRepository.findByTeacherId).not.toHaveBeenCalled();
});

it('unions all three teacher relationships and requests ideas by child rather than idea author', async () => {
  vi.mocked(TeacherUserRepository.findByTeacherId).mockResolvedValue([{ userId: 7 }] as TeacherUser[]);
  vi.mocked(ProjectRepository.findAll).mockResolvedValue([{ id: 1 }] as Project[]);
  vi.mocked(MeetRepository.findActiveByTeacherId).mockResolvedValue([{ id: 2 }] as Meet[]);
  vi.mocked(ProjectUserRepository.findByProjectIds).mockResolvedValue([{ projectId: 1, userId: 7 }, { userId: 8 }] as ProjectUser[]);
  vi.mocked(MeetUserRepository.findByMeetIds).mockResolvedValue([{ meetId: 2, userId: 9 }] as MeetUser[]);
  vi.mocked(IdeaRepository.findByUserIds).mockResolvedValue([{ id: 30, userId: 7, passportId: 80, title: 'Идея родителя', description: '', image: null, createdAt: '2026-10-01', today: false, photos: [], userCount: 0, isLiked: 0 }] as Idea[]);
  vi.mocked(ProjectRepository.findByIdeaIds).mockResolvedValue([{ id: 1, ideaId: 30, title: 'Реализация' }, { id: 3, ideaId: 30, title: 'Другой проект' }] as Project[]);
  vi.mocked(MeetRepository.findByProjectIds).mockResolvedValue([{ id: 2, projectId: 1, status: 'published', deletedAt: null }] as Meet[]);
  const result = await TeacherIdeaService.findIdeasByTeacher(42);
  expect(UserRepository.findByIds).toHaveBeenCalledWith([7, 8, 9], true);
  expect(IdeaRepository.findByUserIds).toHaveBeenCalledExactlyOnceWith([7]);
  expect(result[0]).toMatchObject({ user: { id: 7, image: '/real.jpg' }, canContactParent: true,
    projects: [{ id: 1, enrolledInProject: true, enrolledInMeets: false }, { id: 3, enrolledInProject: false, enrolledInMeets: false }] });
  expect(result[0].user).not.toHaveProperty('passportId');
});

it.each([undefined, 597])('denies contact for an unrelated child before creating a chat: place=%s', async placeId => {
  await expect(StudentAccessService.parentConversation(42, 7, placeId)).rejects.toMatchObject({ status: 403 });
  expect(ConversationService.startConversation).not.toHaveBeenCalled();
});

it('requires centre administration before looking up its students', async () => {
  vi.mocked(PlaceTeacherService.requireAdmin).mockRejectedValue(new Error('Denied'));
  await expect(StudentAccessService.parentConversation(42, 7, 597)).rejects.toThrow('Denied');
  expect(MeetRepository.findPublishedByPlaceId).not.toHaveBeenCalled();
  expect(ConversationService.startConversation).not.toHaveBeenCalled();
});

it('resolves the parent server-side and rechecks access on every opening', async () => {
  vi.mocked(TeacherUserRepository.findByTeacherId).mockResolvedValue([{ userId: 7 }] as TeacherUser[]);
  await StudentAccessService.parentConversation(42, 7);
  expect(ConversationService.startConversation).toHaveBeenCalledExactlyOnceWith({ passportId: 42, targetPassportId: 80 });
  vi.mocked(TeacherUserRepository.findByTeacherId).mockResolvedValue([]);
  await expect(StudentAccessService.parentConversation(42, 7)).rejects.toMatchObject({ status: 403 });
  expect(ConversationService.startConversation).toHaveBeenCalledTimes(1);
});
