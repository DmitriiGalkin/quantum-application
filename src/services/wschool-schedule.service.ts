import type { PoolConnection } from 'mysql2/promise';
import PassportRepository from '../repositories/passport.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import DemoSeedRepository from '../repositories/demo-seed.repository.js';
import DemoSchemaRepository from '../repositories/demo-schema.repository.js';
import type { DemoSeedRecord } from '../entities/demo-seed.js';
import { checkHours, nameMatches, normalizeName, projectTitle, scheduleSeedKey, sessionsFor, teacherAssignments } from './wschool-schedule.js';
import type { ScheduleDocument, SourcePortrait, TeacherReference } from './wschool-schedule.js';

type Row = Record<string, unknown>;
export interface ScheduleSnapshot {
  passport: Awaited<ReturnType<typeof PassportRepository.inspectDirectory>>;
  place: Row;
  members: Row[];
  days: Row[];
  projects: Row[];
  meets: Row[];
  registry: DemoSeedRecord[];
}
const id = (r: Row) => Number(r.id);
const instant = (v: unknown): number => v instanceof Date ? v.getTime()
  : Date.parse(String(v).replace(' ', 'T') + (/Z$|[+-]\d\d:\d\d$/.test(String(v)) ? '' : '+03:00'));
const unique = <T>(rows: T[], label: string): T | undefined => {
  if (rows.length > 1) throw new Error(`Ambiguous ${label}`);
  return rows[0];
};

export class WschoolScheduleService {
  static async inspect(conn: PoolConnection): Promise<ScheduleSnapshot> {
    const metadata = await DemoSchemaRepository.maintenanceMetadata(conn);
    const columns = await DemoSchemaRepository.columns(conn);
    const fields: Record<string, string[]> = {
      passport: ['id', 'title', 'image', 'provider', 'providerId', 'email', 'accessToken'],
      place: ['id', 'title', 'description'], placePassport: ['id', 'placeId', 'passportId', 'role'],
      placeSchedule: ['id', 'placeId', 'weekday', 'enabled', 'startTime', 'endTime'],
      project: ['id', 'placeId', 'passportId', 'title', 'description', 'image', 'deletedAt', 'locationId'],
      meet: ['id', 'placeId', 'projectId', 'passportId', 'duration', 'price', 'startedAt', 'status', 'deletedAt', 'locationId', 'maxParticipants'],
      demoSeedRecord: ['seedKey', 'entityType', 'entityKey', 'recordId'],
    };
    for (const [table, required] of Object.entries(fields)) {
      if (!metadata.tables.some(r => String(r.tableName).toLowerCase() === table.toLowerCase() && r.engine === 'InnoDB') || metadata.triggers.some(r => String(r.tableName).toLowerCase() === table.toLowerCase())) throw new Error(`Unreviewed table: ${table}`);
      for (const field of required) if (!columns.some(c => c.tableName.toLowerCase() === table.toLowerCase() && c.columnName === field)) throw new Error(`Missing ${table}.${field}`);
    }
    for (const [table, field] of [['passport', 'image'], ['passport', 'email'], ['passport', 'accessToken'], ['project', 'image'], ['meet', 'price'], ['meet', 'maxParticipants']]) {
      if (!columns.some(c => c.tableName.toLowerCase() === table.toLowerCase() && c.columnName === field && c.nullable === 'YES')) throw new Error(`Expected nullable ${table}.${field}`);
    }
    const passport = await PassportRepository.inspectDirectory(conn);
    const place = (await PlaceRepository.inspectSeedRows(conn)).find(r => r.id === 597);
    if (!place || normalizeName(String(place.title)) !== normalizeName('Живой источник')) throw new Error('Expected center 597: Живой источник');
    const members = (await PlacePassportRepository.inspectSeedRows(conn)).filter(r => r.placeId === 597);
    const days = await PlaceScheduleRepository.findByPlaceId(597, conn);
    return {
      passport, place, members, days: days.map(d => ({ ...d })),
      projects: (await ProjectRepository.inspectSeedRows(conn)).filter(r => r.placeId === 597),
      meets: await MeetRepository.inspectSeedRows(conn),
      registry: (await DemoSeedRepository.inspectSeedRows(conn)).map(r => ({ seedKey: String(r.seedKey), entityType: String(r.entityType) as DemoSeedRecord['entityType'], entityKey: String(r.entityKey), recordId: Number(r.recordId) })),
    };
  }

  static plan(doc: ScheduleDocument, s: ScheduleSnapshot, portraits: SourcePortrait[]) {
    const registered = (type: DemoSeedRecord['entityType'], key: string, rows: Row[]) => {
      const record = s.registry.find(r => r.seedKey === scheduleSeedKey && r.entityType === type && r.entityKey === key);
      if (!record) return undefined;
      const row = rows.find(r => id(r) === record.recordId);
      if (!row) throw new Error(`Previously imported ${type}/${key} missing`);
      return row;
    };
    const teachers = teacherAssignments.map(t => {
      const registeredRow = registered('passport', t.key, s.passport);
      let row = registeredRow;
      if (!row) {
        if ('expectedId' in t) {
          row = s.passport.find(p => p.id === t.expectedId);
          if (!row || !['Дмитрий А.', t.title].includes(String(row.title))) throw new Error('Expected Dmitry passport 42');
        } else {
          const matches = s.passport.filter(p => nameMatches(p.title, t.title));
          const members = matches.filter(p => s.members.some(m => m.passportId === p.id));
          row = unique(members.length ? members : matches, `teacher ${t.title}`);
        }
      }
      const previousIdentity = s.passport.find(p => p.provider === 'quantum-directory' && p.providerId === `${scheduleSeedKey}:${t.key}`);
      if (previousIdentity && previousIdentity.id !== row?.id) throw new Error(`Directory identity changed: ${t.key}`);
      if (registeredRow && !nameMatches(String(registeredRow.title), t.title)
        && !(t.key === 'dmitry' && registeredRow.id === 42 && registeredRow.title === 'Дмитрий А.')) throw new Error(`Imported teacher changed: ${t.key}`);
      return { ...t, row, member: row ? unique(s.members.filter(m => m.passportId === row!.id), `membership ${t.key}`) : undefined };
    });
    const days = s.days.map(d => ({ ...d }));
    for (const weekday of [2, 4]) {
      const day = unique(days.filter(d => d.weekday === weekday), `weekday ${weekday}`);
      if (!day || !day.enabled) throw new Error(`Missing enabled center weekday ${weekday}`);
      if (String(day.endTime) < '18:45:00') day.endTime = '18:45:00';
    }
    const hourDays = days.map(d => ({ weekday: Number(d.weekday), enabled: Boolean(d.enabled), startTime: String(d.startTime), endTime: String(d.endTime) }));
    const activities = doc.schedule.activities.filter(a => teacherAssignments.some(t => (t.activities as readonly number[]).includes(a.number))).map(a => {
      const teacher = teachers.find(t => (t.activities as readonly number[]).includes(a.number))!;
      const title = projectTitle(a);
      const saved = registered('project', `activity-${a.number}`, s.projects);
      const matches = s.projects.filter(p => p.deletedAt == null && p.passportId === teacher.row?.id
        && [title, a.name].some(v => normalizeName(String(p.title)) === normalizeName(v))
        && (a.name !== 'Капоэйра' || normalizeName(String(p.title)) === normalizeName(title)));
      const project = saved ?? unique(matches, `project ${title}`);
      if (project && (project.deletedAt != null || project.passportId !== teacher.row?.id
        || project.placeId !== 597 || normalizeName(String(project.title)) !== normalizeName(title))) throw new Error(`Project ${a.number} differs; review required`);
      return { activity: a, title, teacher, project };
    });
    const skipped: { activity: number; startedAt: string; reason: string }[] = [];
    const meetings = activities.flatMap(a => sessionsFor(doc, a.activity).flatMap(slot => {
      checkHours(slot.startedAt, slot.duration, hourDays);
      const key = `${a.activity.number}:${slot.sqlStart}`;
      const saved = registered('meet', key, s.meets);
      const matches = a.project ? s.meets.filter(m => m.projectId === a.project!.id && instant(m.startedAt) === Date.parse(slot.startedAt)) : [];
      const existing = saved ?? unique(matches, `meeting ${key}`);
      if (existing && (existing.deletedAt != null || existing.status === 'cancelled' || existing.duration !== slot.duration
        || existing.passportId !== a.teacher.row?.id || existing.projectId !== a.project?.id || existing.placeId !== 597
        || instant(existing.startedAt) !== Date.parse(slot.startedAt))) throw new Error(`Existing meeting differs: ${key}`);
      const conflict = a.teacher.row && s.meets.find(m => m.id !== existing?.id && m.passportId === a.teacher.row!.id
        && m.deletedAt == null && ['pending', 'published'].includes(String(m.status))
        && instant(m.startedAt) < Date.parse(slot.startedAt) + slot.duration * 60000
        && instant(m.startedAt) + Number(m.duration ?? 60) * 60000 > Date.parse(slot.startedAt));
      if (conflict) {
        skipped.push({ activity: a.activity.number, startedAt: slot.startedAt, reason: `Teacher conflict with meet ${id(conflict)}` });
        return [];
      }
      return [{ ...slot, key, activity: a.activity.number, existing }];
    }));
    // Also catch collisions introduced by this manifest, even for newly created teachers.
    for (let i = 0; i < meetings.length; i++) for (let j = i + 1; j < meetings.length; j++) {
      const a = meetings[i], b = meetings[j];
      const ta = activities.find(x => x.activity.number === a.activity)!.teacher.key;
      const tb = activities.find(x => x.activity.number === b.activity)!.teacher.key;
      if (ta === tb && Date.parse(a.startedAt) < Date.parse(b.startedAt) + b.duration * 60000
        && Date.parse(b.startedAt) < Date.parse(a.startedAt) + a.duration * 60000) throw new Error(`Manifest teacher overlap: ${a.activity}/${b.activity}`);
    }
    const photoUpdates = s.passport.filter(p => s.members.some(m => m.passportId === p.id)).flatMap(p => {
      const title = p.id === 42 ? teacherAssignments[0].title : p.title;
      const photo = unique(portraits.filter(photo => nameMatches(photo.title, title)), `portrait ${p.id}`);
      return photo ? [{ passportId: p.id, title: p.title, previousImage: p.image, sourceUrl: photo.sourceUrl, image: photo.image }] : [];
    });
    return { teachers, days, activities, meetings, skipped, photoUpdates,
      additions: { teachers: teachers.filter(t => !t.row).length, memberships: teachers.filter(t => !t.member).length,
        projects: activities.filter(a => !a.project).length, meetings: meetings.filter(m => !m.existing).length } };
  }

  static async apply(conn: PoolConnection, doc: ScheduleDocument, snapshot: ScheduleSnapshot, portraits: SourcePortrait[]) {
    const plan = this.plan(doc, snapshot, portraits);
    if (plan.photoUpdates.some(p => !p.image)) throw new Error('Portraits must be uploaded before applying');
    const registry = [...snapshot.registry];
    const save = async (type: DemoSeedRecord['entityType'], key: string, recordId: number) => {
      // The registry has a global UNIQUE(entityType, recordId); adopted rows can belong to the older setup.
      if (!registry.some(r => r.entityType === type && r.recordId === recordId)) {
        await DemoSeedRepository.save({ seedKey: scheduleSeedKey, entityType: type, entityKey: key, recordId }, conn);
        registry.push({ seedKey: scheduleSeedKey, entityType: type, entityKey: key, recordId });
      }
    };
    const teacherRefs = new Map<string, TeacherReference>();
    for (const t of plan.teachers) {
      const passportId = t.row ? id(t.row) : await PassportRepository.create({ provider: 'quantum-directory', providerId: `${scheduleSeedKey}:${t.key}`,
        title: t.title, description: 'Преподаватель центра «Живой источник». Справочный профиль без доступа к авторизации.', email: null, accessToken: null, image: null }, conn);
      await save('passport', t.key, passportId);
      const memberId = t.member ? id(t.member) : await PlacePassportRepository.create({ placeId: 597, passportId, role: 'teacher' }, conn);
      await save('placePassport', t.key, memberId);
      teacherRefs.set(t.key, { passportId, title: t.row ? String(t.row.title) : t.title, url: `/teachers/${passportId}`,
        image: plan.photoUpdates.find(p => p.passportId === passportId)?.image ?? (t.row?.image ? String(t.row.image) : null) });
    }
    for (const photo of plan.photoUpdates) if (photo.image !== photo.previousImage) await PassportRepository.update(photo.passportId, { image: photo.image }, conn);
    for (const day of plan.days) {
      const before = snapshot.days.find(d => d.id === day.id)!;
      if (day.endTime !== before.endTime) await PlaceScheduleRepository.saveSeedDay(id(day), 597,
        { weekday: Number(day.weekday), enabled: Boolean(day.enabled), startTime: String(day.startTime), endTime: String(day.endTime) }, conn);
    }
    const dayNames = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
    const groupedHours = new Map<string, string[]>();
    for (const d of [...plan.days].sort((a, b) => Number(a.weekday) - Number(b.weekday))) {
      const time = d.enabled ? `${String(d.startTime).slice(0, 5)}–${String(d.endTime).slice(0, 5)}` : 'выходные';
      groupedHours.set(time, [...(groupedHours.get(time) ?? []), dayNames[Number(d.weekday) - 1]]);
    }
    const hours = 'Часы (МСК): ' + [...groupedHours].map(([time, days]) => `${days.join(', ')} ${time}`).join('; ') + '.';
    let description = String(snapshot.place.description ?? '');
    description = description.replace(/Понедельник–пятница: 08:00–18:00 \(МСК\)\. Суббота и воскресенье: выходные\./g, hours);
    description = description.replace(/Часы работы \(МСК\):[^\n]*/g, hours);
    description = description.replace(/Часы \(МСК\):[^\n]*/g, hours);
    if (!description.includes(hours)) description += `\n${hours}`;
    if ([...description].length > 255) throw new Error('Center description exceeds varchar(255); preserve contacts and review text');
    if (description !== snapshot.place.description) await PlaceRepository.update(597, { description }, conn);
    const projectIds = new Map<number, number>();
    for (const a of plan.activities) {
      const teacher = teacherRefs.get(a.teacher.key)!;
      const age = a.activity.age ? `\nВозраст: ${a.activity.age.min ?? ''}${a.activity.age.max ? `–${a.activity.age.max}` : '+'} лет.` : '';
      const description = `${a.title}. Центр «Живой источник».\nПреподаватель: ${a.teacher.title}.${age}\n${a.activity.sessions.length ? 'Расписание перенесено с фотографии центра. Встречи ожидают согласования; стоимость и число мест уточняются.' : 'Занятия по договоренности с преподавателем; время и стоимость уточняются.'}`;
      const projectId = a.project ? id(a.project) : await ProjectRepository.create({ placeId: 597, passportId: teacher.passportId, title: a.title, description, image: null, locationId: null }, conn);
      await save('project', `activity-${a.activity.number}`, projectId);
      projectIds.set(a.activity.number, projectId);
    }
    const meetings = [];
    for (const m of plan.meetings) {
      const a = plan.activities.find(a => a.activity.number === m.activity)!;
      const teacher = teacherRefs.get(a.teacher.key)!;
      const meetId = m.existing ? id(m.existing) : await MeetRepository.create({ placeId: 597, passportId: teacher.passportId, projectId: projectIds.get(m.activity)!,
        startedAt: m.sqlStart, duration: m.duration, price: null, locationId: a.project?.locationId == null ? null : Number(a.project.locationId), maxParticipants: null }, conn);
      await save('meet', m.key, meetId);
      meetings.push({ activity: m.activity, id: meetId, startedAt: m.startedAt });
    }
    for (const a of doc.schedule.activities) {
      const t = teacherAssignments.find(t => (t.activities as readonly number[]).includes(a.number));
      a.teacher = t ? teacherRefs.get(t.key)! : null;
      const projectId = projectIds.get(a.number);
      a.project = projectId ? { id: projectId, url: `/project/${projectId}` } : null;
    }
    doc.import!.teachers = [...teacherRefs.values()];
    doc.import!.meetings = meetings;
    doc.import!.skipped = plan.skipped;
    return { additions: plan.additions, projects: [...projectIds.values()], meetings, skipped: plan.skipped, photos: plan.photoUpdates };
  }
}
