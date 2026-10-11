import { describe, expect, it } from 'vitest';
import { buildDemoMeetings, demoIdeas, demoPlaces, demoProjectDescription, demoProjectTeacherIndex, demoProjectPlaceIndex, demoTeachers, DEMO_SEED_KEY } from './demo-seed.data.js';
import { externalDemoReferences } from './demo-seed.service.js';
import type { DemoSeedRecord } from 'entities';

describe('demo content and schedule', () => {
  it('provides the complete, individually keyed content set', () => {
    expect(new Set(demoIdeas.map(idea => idea.key)).size).toBe(12);
    expect(demoTeachers).toHaveLength(6);
    expect(demoPlaces).toHaveLength(4);
    expect(demoPlaces.every(place => place.description.length <= 255 && place.description.includes('демонстрационный'))).toBe(true);
    expect(demoProjectDescription(12, true)).toContain('готовый результат заранее не обещаем');
  });

  it.each(['2026-10-10T20:59:00Z', '2026-10-10T21:01:00Z', '2026-12-31T23:59:00Z'])('keeps future Moscow slots within opening hours without teacher or centre overlap at %s', timestamp => {
    const now = new Date(timestamp);
    const meetings = buildDemoMeetings(now);
    expect(meetings).toHaveLength(40);
    expect(new Set(meetings.map(meet => meet.key)).size).toBe(40);
    for (const meeting of meetings) {
      const started = new Date(meeting.startedAt).getTime();
      const hour = new Date(started + 3 * 3600000).getUTCHours();
      expect(started).toBeGreaterThan(now.getTime());
      expect(started).toBeLessThan(now.getTime() + 21 * 86400000);
      expect(hour).toBeGreaterThanOrEqual(9);
      expect(hour + meeting.duration / 60).toBeLessThanOrEqual(20);
      for (const other of meetings.filter(item => item.key !== meeting.key)) {
        const shared = demoProjectTeacherIndex(meeting.projectIndex) === demoProjectTeacherIndex(other.projectIndex) || demoProjectPlaceIndex(meeting.projectIndex) === demoProjectPlaceIndex(other.projectIndex);
        const otherStarted = new Date(other.startedAt).getTime();
        if (shared) expect(started >= otherStarted + other.duration * 60000 || otherStarted >= started + meeting.duration * 60000).toBe(true);
      }
    }
  });
});

describe('demo removal protection', () => {
  const records: DemoSeedRecord[] = [
    { seedKey: DEMO_SEED_KEY, entityType: 'passport', entityKey: 'teacher-1', recordId: 10 },
    { seedKey: DEMO_SEED_KEY, entityType: 'meet', entityKey: 'meet-1', recordId: 20 },
    { seedKey: DEMO_SEED_KEY, entityType: 'user', entityKey: 'student-1', recordId: 30 },
    { seedKey: DEMO_SEED_KEY, entityType: 'meetUser', entityKey: 'meet-1/student-1', recordId: 40 },
  ];
  it('allows owned rows and unrelated existing records', () => {
    expect(externalDemoReferences(records, { meetUser: [{ id: 40, meetId: 20, userId: 30 }, { id: 50, meetId: 99, userId: 98 }] })).toEqual([]);
  });
  it('blocks real signups, payment targets and conversation memberships without an ID column', () => {
    expect(externalDemoReferences(records, {
      meetUser: [{ id: 50, meetId: 20, userId: 98 }],
      payment: [{ id: 60, passportId: 99, userId: 98, targetType: 'meet', targetId: 20 }],
      conversationPassport: [{ conversationId: 70, passportId: 10 }],
    })).toEqual(['meetUser#50.meetId', 'payment#60.targetId', 'conversationPassport#70.passportId']);
  });
});
