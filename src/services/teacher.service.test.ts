import { expect, it, vi } from 'vitest';
import type { IdeaDto, Passport, PlaceRow, Project } from 'entities';
import { toPlace } from '../mappers/place.mapper.js';

vi.mock('../utils/dbNext.js', () => ({ db: {} }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { findById: vi.fn() } }));
vi.mock('../repositories/project.repository.js', () => ({ default: { findAll: vi.fn() } }));
vi.mock('../repositories/idea.repository.js', () => ({ default: { findByTeacherId: vi.fn().mockResolvedValue([]) } }));
vi.mock('../repositories/user.repository.js', () => ({ default: { findByIds: vi.fn().mockResolvedValue([]) } }));
vi.mock('../repositories/place.repository.js', () => ({ default: { findByIds: vi.fn(), findByPassportId: vi.fn() } }));
vi.mock('../repositories/meet.repository.js', () => ({ default: { findByProjectIds: vi.fn().mockResolvedValue([]) } }));
vi.mock('./participants.service.js', () => ({ ParticipantsService: { forProjects: vi.fn().mockResolvedValue(new Map()) } }));
vi.mock('./meet.service.js', () => ({ MeetService: { hydrateAll: vi.fn().mockResolvedValue([]) } }));
vi.mock('./idea.service.js', () => ({ IdeaService: { findByIds: vi.fn() } }));

import { TeacherService } from './teacher.service.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import { IdeaService } from './idea.service.js';

it('preserves source idea and center photo, description and address through the public teacher DTO', async () => {
  const place = toPlace({ id: 9, title: 'Center', description: 'About center', image: '/center.jpg', address: 'Address', latitude: 0, longitude: 0 } as PlaceRow);
  const idea: IdeaDto = { id: 54, title: 'Idea', description: '', image: null, userId: 0, passportId: null,
    userCount: 0, createdAt: '', isLiked: 0, today: false, photos: [], user: null };
  vi.mocked(PassportRepository.findById).mockResolvedValue({ id: 42, title: 'Teacher' } as Passport);
  vi.mocked(ProjectRepository.findAll).mockResolvedValue([
    { id: 100, ideaId: 54, passportId: 42, placeId: 9 } as Project,
    { id: 101, ideaId: null, passportId: 42, placeId: 9 } as Project,
  ]);
  vi.mocked(PlaceRepository.findByIds).mockResolvedValue([place]);
  vi.mocked(PlaceRepository.findByPassportId).mockResolvedValue([place]);
  vi.mocked(IdeaService.findByIds).mockResolvedValue([idea]);
  const teacher = await TeacherService.findById(42);
  expect(IdeaService.findByIds).toHaveBeenCalledWith([54]);
  expect(teacher?.projects[0].idea).toEqual(idea);
  expect(teacher?.projects[1].idea).toBeNull();
  expect(teacher?.projects[0].place).toMatchObject({ image: '/center.jpg', description: 'About center', address: 'Address' });
  expect(teacher?.centers[0]).toEqual(place);
});
