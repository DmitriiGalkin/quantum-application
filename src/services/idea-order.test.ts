import { beforeEach, expect, it, vi } from 'vitest';
import type { GetIdeasQuery } from 'entities';
vi.mock('../repositories/idea.repository.js', () => ({ default: { findAll: vi.fn(async () => []) } }));
vi.mock('../utils/dbNext.js', () => ({ db: {} }));
vi.mock('./assistant/assistants/image.assistant.js', () => ({ generateIdeaImage: vi.fn() }));
import IdeaRepository from '../repositories/idea.repository.js';
import { IdeaService } from './idea.service.js';

beforeEach(() => vi.clearAllMocks());
it.each([{}, { latitude: 55.75 }, { longitude: 37.62 }])('uses new ordering when nearby coordinates are missing: %j', async coordinates => {
  await expect(IdeaService.findAll({ sort: 'nearby', when: 'today', ...coordinates })).resolves.toEqual([]);
  expect(IdeaRepository.findAll).toHaveBeenCalledWith({ sort: 'new', when: 'today', latitude: undefined, longitude: undefined });
});
it('validates supplied coordinates and still accepts actual zero coordinates', async () => {
  await expect(IdeaService.findAll({ sort: 'nearby', latitude: 91, longitude: 0 })).rejects.toThrow('Некорректные координаты');
  await expect(IdeaService.findAll({ sort: 'nearby', latitude: 0, longitude: 0 })).resolves.toEqual([]);
  expect(IdeaRepository.findAll).toHaveBeenLastCalledWith({ sort: 'nearby', latitude: 0, longitude: 0 });
  await IdeaService.findAll({ sort: 'nearby', latitude: '55.75', longitude: '37.62' } as unknown as GetIdeasQuery);
  expect(IdeaRepository.findAll).toHaveBeenLastCalledWith({ sort: 'nearby', latitude: 55.75, longitude: 37.62 });
});
