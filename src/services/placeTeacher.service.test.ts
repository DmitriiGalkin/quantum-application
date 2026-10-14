import { expect, it, vi } from 'vitest';
import type { Passport } from 'entities';

vi.mock('../repositories/place-passport.repository.js', () => ({ default: { members: vi.fn() } }));
vi.mock('../repositories/passport.repository.js', () => ({ default: { findByIds: vi.fn() } }));
import PlaceTeacherService from './placeTeacher.service.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PassportRepository from '../repositories/passport.repository.js';

it('keeps centre members and exposes only public teacher fields', async () => {
  vi.mocked(PlacePassportRepository.members).mockResolvedValue([
    { passportId: 44, role: 'teacher' }, { passportId: 42, role: 'admin' }, { passportId: 44, role: 'teacher' },
  ]);
  const passport: Passport = { id: 44, title: 'Анна', description: 'Ремесло', image: 'https://example.com/anna.png',
    provider: 'test', providerId: 'private-id', accessToken: 'private-token', email: 'private@example.com' };
  vi.mocked(PassportRepository.findByIds).mockResolvedValue([passport, { ...passport, id: 42, title: 'Дмитрий' }]);
  const result = await PlaceTeacherService.findAll(597);
  expect(PassportRepository.findByIds).toHaveBeenCalledWith([44, 42]);
  expect(result).toEqual([
    { id: 44, title: 'Анна', description: 'Ремесло', image: passport.image },
    { id: 42, title: 'Дмитрий', description: 'Ремесло', image: passport.image },
  ]);
});
