import { withinPlaceHours } from '../shared/lib/meet-time.js';

export const scheduleSeedKey = 'quantum-wschool-schedule-v1';
export const teacherAssignments = [
  { key: 'dmitry', title: 'Дмитрий Александрович Галкин', expectedId: 42, activities: [8] },
  { key: 'korshunova', title: 'Юлия Коршунова', activities: [1] },
  { key: 'osipova', title: 'Марина Осипова', activities: [2] },
  { key: 'grigorieva', title: 'Вера Владимировна Григорьева', activities: [3, 4, 12] },
  { key: 'chertov', title: 'Руслан Александрович Чертов', activities: [5, 11] },
  { key: 'zazimko', title: 'Евгений Зазимко', activities: [10] },
] as const;

export interface TeacherReference {
  passportId: number;
  title: string;
  url: string;
  image: string | null;
}
export interface ScheduleActivity {
  number: number;
  name: string;
  subtitle?: string | null;
  audience: string | null;
  age: { min: number | null; max: number | null; unit: string } | null;
  sessions: { weekday: number; start: string; end: string }[];
  schedule_status: string;
  teacher?: TeacherReference | null;
  project?: { id: number; url: string } | null;
}
export interface ScheduleDocument {
  source: Record<string, unknown>;
  schedule: {
    activities: ScheduleActivity[];
    timezone: string | null;
    placeId?: number;
  };
  analysis: Record<string, unknown>;
  import?: {
    seedKey: string;
    windowStart: string;
    windowEnd: string;
    committedAt?: string;
    teachers?: TeacherReference[];
    meetings?: { activity: number; id: number; startedAt: string }[];
    skipped?: { activity: number; startedAt: string; reason: string }[];
  };
}

export function validateSchedule(value: unknown): ScheduleDocument {
  if (!value || typeof value !== 'object') throw new Error('Schedule must be an object');
  const doc = value as ScheduleDocument;
  if (!doc.source || !doc.analysis || !doc.schedule || !Array.isArray(doc.schedule.activities)
    || doc.schedule.activities.length !== 12) throw new Error('Expected original 12 activities');
  const seen = new Set<number>();
  const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  for (const a of doc.schedule.activities) {
    if (!a || !Number.isInteger(a.number) || a.number < 1 || a.number > 12 || seen.has(a.number)
      || typeof a.name !== 'string' || !a.name.trim() || !Array.isArray(a.sessions)) throw new Error('Invalid activity');
    seen.add(a.number);
    for (const s of a.sessions) {
      if (!s || !Number.isInteger(s.weekday) || s.weekday < 1 || s.weekday > 7
        || !time.test(s.start) || !time.test(s.end) || s.end <= s.start) throw new Error(`Invalid session: ${a.number}`);
    }
  }
  if (doc.import && (doc.import.seedKey !== scheduleSeedKey
    || !Number.isFinite(Date.parse(doc.import.windowStart))
    || Date.parse(doc.import.windowEnd) - Date.parse(doc.import.windowStart) !== 28 * 86400000)) throw new Error('Invalid fixed import window');
  return doc;
}

export function fixWindow(doc: ScheduleDocument, now: Date): void {
  doc.schedule.placeId = 597;
  doc.schedule.timezone = 'Europe/Moscow';
  doc.import ??= { seedKey: scheduleSeedKey, windowStart: now.toISOString(), windowEnd: new Date(now.getTime() + 28 * 86400000).toISOString() };
  const craft = doc.schedule.activities.find(a => a.number === 4)!;
  craft.subtitle = 'Фабрика идей';
  if (Array.isArray(doc.analysis.uncertain_readings)) {
    doc.analysis.uncertain_readings = doc.analysis.uncertain_readings.filter((r: { activity_number?: number; field?: string }) => r.activity_number !== 4 || r.field !== 'subtitle');
  }
}

export function normalizeName(value: string): string {
  return value.toLowerCase().replaceAll('ё', 'е').replace(/[^а-яa-z0-9]+/g, ' ').trim().split(/\s+/).sort().join(' ');
}

export function nameMatches(actual: string, expected: string): boolean {
  const actualTokens = normalizeName(actual).split(' ');
  const expectedTokens = normalizeName(expected).split(' ');
  return expectedTokens.every(token => actualTokens.includes(token));
}

export function projectTitle(a: ScheduleActivity): string {
  return a.number === 4 ? 'Рукоделие «Фабрика идей»'
    : a.name + (a.audience === 'adults' ? ' — взрослые' : a.number === 5 ? ' — дети' : '');
}

export function sessionsFor(doc: ScheduleDocument, activity: ScheduleActivity) {
  if (!doc.import) throw new Error('Import window missing');
  const min = Date.parse(doc.import.windowStart);
  const max = Date.parse(doc.import.windowEnd);
  const first = new Date(min + 3 * 3600000).toISOString().slice(0, 10);
  const sessions: { startedAt: string; duration: number; sqlStart: string }[] = [];
  for (let day = 0; day <= 28; day++) {
    const date = new Date(Date.parse(`${first}T00:00:00Z`) + day * 86400000);
    for (const s of activity.sessions.filter(s => s.weekday === (date.getUTCDay() || 7))) {
      const startedAt = `${date.toISOString().slice(0, 10)}T${s.start}:00+03:00`;
      if (Date.parse(startedAt) < min || Date.parse(startedAt) >= max) continue;
      const minutes = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
      sessions.push({ startedAt, duration: minutes(s.end) - minutes(s.start), sqlStart: startedAt.slice(0, 19).replace('T', ' ') });
    }
  }
  return sessions;
}

export function checkHours(startedAt: string, duration: number, days: Parameters<typeof withinPlaceHours>[2]): void {
  if (!withinPlaceHours(startedAt, duration, days)) throw new Error(`Outside center hours: ${startedAt}`);
}

export interface SourcePortrait { title: string; sourceUrl: string; image?: string }
export function teacherPortraits(html: string): SourcePortrait[] {
  const result: SourcePortrait[] = [];
  for (const match of html.matchAll(/<li\b[^>]*class="t526__col[\s\S]*?<\/li>/g)) {
    const sourceUrl = match[0].match(/<meta itemprop="image" content="([^"]+)"/)?.[1];
    const caption = match[0].match(/<meta itemprop="caption" content="([^"]+)"/)?.[1]?.replace(/\s+(Красногорск|капоэйра)$/i, '');
    const visible = match[0].match(/class="t526__persname[^>]*>([\s\S]*?)<\/div>/)?.[1]
      ?.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const visibleNames = visible?.match(/[А-ЯЁа-яё]+/g) ?? [];
    // Visible full names take precedence: this page has stale/incomplete image captions.
    const title = visibleNames.length >= 3 ? visible
      : caption && visibleNames.length >= 2 && visibleNames.every(n => normalizeName(caption).split(' ').includes(normalizeName(n))) ? caption
        : visible ?? caption;
    if (sourceUrl && title && new URL(sourceUrl).hostname === 'static.tildacdn.com') result.push({ title, sourceUrl });
  }
  if (!result.length) throw new Error('No labelled teacher cards found');
  return result;
}
