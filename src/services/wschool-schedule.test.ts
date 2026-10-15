import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fixWindow, normalizeName, sessionsFor, teacherAssignments, teacherPortraits, validateSchedule } from './wschool-schedule.js';
import { WschoolScheduleService } from './wschool-schedule.service.js';
import type { ScheduleSnapshot } from './wschool-schedule.service.js';

function document() {
  const doc = validateSchedule(JSON.parse(readFileSync('wschool-schedule.json', 'utf8')));
  delete doc.import;
  fixWindow(doc, new Date('2026-10-15T10:00:00Z'));
  return doc;
}
function snapshot(): ScheduleSnapshot {
  return {
    passport: teacherAssignments.map((t, i) => ({ id: i === 0 ? 42 : 100 + i, title: i === 0 ? 'Дмитрий А.' : t.title, image: null, provider: 'quantum-directory', providerId: t.key })),
    place: { id: 597, title: 'Живой источник', description: '' },
    members: teacherAssignments.map((_, i) => ({ id: i + 1, placeId: 597, passportId: i === 0 ? 42 : 100 + i, role: 'teacher' })),
    days: Array.from({ length: 7 }, (_, i) => ({ id: i + 1, placeId: 597, weekday: i + 1, enabled: i < 5, startTime: '08:00:00', endTime: '18:00:00' })),
    projects: [], meets: [], registry: [],
  };
}

describe('wschool schedule import', () => {
  it('generates 48 meetings for nine assigned projects, with Moscow time and correct durations', () => {
    const doc = document();
    const plan = WschoolScheduleService.plan(doc, snapshot(), []);
    expect(plan.additions).toEqual({ teachers: 0, memberships: 0, projects: 9, meetings: 48 });
    expect(plan.activities.filter(a => !a.activity.sessions.length).map(a => a.activity.number)).toEqual([10, 11]);
    expect(plan.meetings.filter(m => m.activity === 12)).toHaveLength(8);
    expect(plan.meetings.filter(m => m.activity === 12).every(m => m.duration === 75)).toBe(true);
    expect(plan.meetings.filter(m => m.activity === 2).every(m => m.duration === 110)).toBe(true);
    expect(plan.meetings[0].startedAt).toMatch(/\+03:00$/);
  });
  it('keeps the fixed window on subsequent runs and excludes a passed session', () => {
    const doc = document();
    const start = doc.import!.windowStart;
    fixWindow(doc, new Date('2026-12-01T12:00:00Z'));
    expect(doc.import!.windowStart).toBe(start);
    doc.import!.windowStart = '2026-10-15T13:00:01Z';
    doc.import!.windowEnd = '2026-11-12T13:00:01Z';
    const rock = sessionsFor(doc, doc.schedule.activities.find(a => a.number === 3)!);
    expect(rock).toHaveLength(8);
    expect(rock.every(s => Date.parse(s.startedAt) >= Date.parse(doc.import!.windowStart))).toBe(true);
  });
  it('reports cross-center teacher conflicts without moving meetings', () => {
    const s = snapshot();
    s.meets.push({ id: 77, placeId: 1, projectId: 1, passportId: 103, startedAt: '2026-10-15 16:00:00', duration: 60, status: 'pending', deletedAt: null });
    const p = WschoolScheduleService.plan(document(), s, []);
    expect(p.additions.meetings).toBe(47);
    expect(p.skipped).toEqual([{ activity: 3, startedAt: '2026-10-15T16:00:00+03:00', reason: 'Teacher conflict with meet 77' }]);
  });
  it('rejects overlapping activities assigned to the same teacher', () => {
    const doc = document();
    doc.schedule.activities.find(a => a.number === 4)!.sessions[0].end = '16:30';
    expect(() => WschoolScheduleService.plan(doc, snapshot(), [])).toThrow('Manifest teacher overlap');
  });
  it('extends only Tuesday and Thursday and does not shorten later existing closing times', () => {
    const s = snapshot();
    s.days[1].endTime = '20:00:00';
    const p = WschoolScheduleService.plan(document(), s, []);
    expect(p.days[1].endTime).toBe('20:00:00');
    expect(p.days[3].endTime).toBe('18:45:00');
    expect(p.days[0]).toEqual(s.days[0]);
    expect(s.days[3].endTime).toBe('18:00:00');
  });
  it('rejects ambiguous accounts and missing previously imported records', () => {
    const s = snapshot();
    s.passport.push({ ...s.passport[1], id: 900 });
    s.members.push({ id: 900, placeId: 597, passportId: 900, role: 'teacher' });
    expect(() => WschoolScheduleService.plan(document(), s, [])).toThrow('Ambiguous teacher');
    const clean = snapshot();
    clean.registry.push({ seedKey: 'quantum-wschool-schedule-v1', entityType: 'project', entityKey: 'activity-1', recordId: 999 });
    expect(() => WschoolScheduleService.plan(document(), clean, [])).toThrow('Previously imported');
  });
  it('matches labelled original portraits by name, never unlabelled nearby images', () => {
    const photos = teacherPortraits('<li class="t526__col"><meta itemprop="image" content="https://static.tildacdn.com/photo.jpg"><meta itemprop="caption" content="Григорьева Вера Владимировна Красногорск"></li>');
    const p = WschoolScheduleService.plan(document(), snapshot(), photos);
    expect(p.photoUpdates.map(p => p.passportId)).toEqual([103]);
    expect(normalizeName('Чертов Руслан Александрович')).toBe(normalizeName('Руслан Александрович Чёртов'));
  });
  it('rejects malformed times and duplicated activity IDs', () => {
    const doc = document();
    doc.schedule.activities[0].sessions[0].start = '25:00';
    expect(() => validateSchedule(doc)).toThrow('Invalid session');
    doc.schedule.activities[0].sessions[0].start = '15:15';
    doc.schedule.activities[1].number = 1;
    expect(() => validateSchedule(doc)).toThrow('Invalid activity');
  });
  it('uses the visible full name when the image caption contains an incorrect patronymic', () => {
    const photos = teacherPortraits('<li class="t526__col"><meta itemprop="image" content="https://static.tildacdn.com/photo.jpg"><meta itemprop="caption" content="Наумова Мария Владимировна"><div class="t526__persname" field="name">Наумова<br>Мария<br>Михайловна</div></li>');
    expect(photos[0].title).toBe('Наумова Мария Михайловна');
  });
});
