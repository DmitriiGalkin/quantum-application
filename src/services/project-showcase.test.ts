import { describe, expect, it } from 'vitest';
import type { MeetDto, ProjectDto } from 'entities';
import { selectShowcaseProjects } from './project-showcase.js';

const now = new Date('2030-01-01T20:00:00Z'); // 23:00 Moscow
const meet = (changes: Partial<MeetDto> = {}): MeetDto => ({
  id: 1, startedAt: '2030-01-01T21:30:00Z', status: 'published', deletedAt: null, ...changes,
} as MeetDto);
const project = (id: number, meets: MeetDto[], count = 0): ProjectDto => ({
  id, meets, users: Array.from({ length: count }, (_, id) => ({ id })),
} as ProjectDto);

describe('project showcase eligibility', () => {
  it('requires one future published meeting, excluding deleted and cancelled meetings', () => {
    const projects = [project(1, [meet()]), project(2, [meet({ status: 'pending' })]),
      project(3, [meet({ status: 'cancelled' })]), project(4, [meet({ deletedAt: '2030-01-01' })]),
      project(5, [meet({ startedAt: now.toISOString() })]), project(6, [])];
    expect(selectShowcaseProjects(projects, { upcomingOnly: true }, now).map(p => p.id)).toEqual([1]);
    expect(selectShowcaseProjects(projects, {}, now)).toHaveLength(6);
    expect(selectShowcaseProjects(projects, { upcomingOnly: 'false' }, now)).toHaveLength(6);
  });
  it('applies the Moscow date and publication requirements to the same meeting', () => {
    const projects = [project(1, [meet()]), project(2, [meet({ startedAt: '2030-01-01T20:30:00Z' })]),
      project(3, [meet({ status: 'pending' }), meet({ startedAt: '2030-01-01T19:00:00Z' })])];
    expect(selectShowcaseProjects(projects, { upcomingOnly: true, when: 'today' }, now).map(p => p.id)).toEqual([2]);
    expect(selectShowcaseProjects(projects, { upcomingOnly: 'true', when: 'tomorrow' }, now).map(p => p.id)).toEqual([1]);
  });
  it('orders popularity by membership then ID without mutating source order', () => {
    const projects = [project(1, [meet()], 5), project(2, [meet()], 0), project(3, [meet()], 5)];
    expect(selectShowcaseProjects(projects, { sort: 'popular' }, now).map(p => p.id)).toEqual([3, 1, 2]);
    expect(projects.map(p => p.id)).toEqual([1, 2, 3]);
    expect(selectShowcaseProjects(projects, { sort: 'nearby' }, now).map(p => p.id)).toEqual([1, 2, 3]);
  });
});
