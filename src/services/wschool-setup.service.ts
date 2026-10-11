import type { PoolConnection } from 'mysql2/promise';
import { isDeepStrictEqual } from 'node:util';
import type { DemoSeedRecord, IdeaPhoto } from '../entities/index.js';
import PassportRepository from '../repositories/passport.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import { IdeaPhotoRepository } from '../repositories/idea-photo.repository.js';
import DemoSeedRepository from '../repositories/demo-seed.repository.js';
import DemoSchemaRepository from '../repositories/demo-schema.repository.js';

// Real directory data: deliberately separate from every fictional demo seed.
export const WSCHOOL_KEY = 'quantum-wschool-real-v1';
export const school = {
  title: 'Живой источник',
  address: 'Московская область, г. Красногорск, мкрн. Опалиха КП "Красногорская усадьба", ул. Тенистая, д.1',
  description: 'Частная школа «Живой источник».\nEmail: wschool2017@yandex.ru\nСайт: https://wschool.ru/\nТелефон: +7 (495) 921 - 10 - 93\nПонедельник–пятница: 08:00–18:00 (МСК). Суббота и воскресенье: выходные.',
  latitude: 55.84367173279719, longitude: 37.24540752748075, phone: '+7 (495) 921 - 10 - 93',
};
export const schoolTeachers = [
  ['khazieva', 'Татьяна Александровна Хазиева'], ['naumova', 'Мария Михайловна Наумова'],
  ['chertov', 'Руслан Александрович Чертов'], ['glamozdina', 'Анастасия Олеговна Гламоздина'],
  ['kunitsyna', 'Ольга Дмитриевна Куницына'], ['shipilova', 'Кристина Вячеславовна Шипилова'],
  ['shestakova', 'Ирина Ивановна Шестакова'], ['varnakov', 'Роман Николаевич Варнаков'],
  ['tulev', 'Андрей Олегович Тулев'], ['grigorieva', 'Вера Владимировна Григорьева'],
] as const;
export const schoolDates = ['2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02'];
export const workshopTitle = 'Деревянный робот — мастерская';
export const workshopDescription = 'Четыре занятия по изготовлению деревянного робота с подвижными деталями на шнуре.\n1. Эскиз и подготовка деревянных заготовок.\n2. Формирование головы, корпуса, рук и ног под руководством мастера.\n3. Шлифовка деталей и сборка на шнуре.\n4. Отделка и проверка подвижности готового изделия.\nПонедельники, 16:00–17:00 (МСК). Участие бесплатное.';
type Row = Record<string, unknown>;
export interface SchoolSnapshot {
  passport: Row[]; place: Row[]; placePassport: Row[]; placeSchedule: Row[];
  project: Row[]; meet: Row[]; idea: Row[]; photos: IdeaPhoto[]; registry: DemoSeedRecord[];
}
const requireFields = (row: Row, fields: Row, label: string) => {
  for (const [field, expected] of Object.entries(fields)) if (row[field] !== expected) throw new Error(`${label} changed: ${field}; no records overwritten`);
};
const instant = (value: unknown) => value instanceof Date ? value.getTime()
  : new Date(String(value).replace(' ', 'T') + (/Z$|[+-]\d\d:\d\d$/.test(String(value)) ? '' : '+03:00')).getTime();
const dateStart = (date: string) => instant(`${date}T16:00:00+03:00`);
const directoryDescription = 'Преподаватель центра «Живой источник». Справочный профиль без доступа к авторизации.';

export class WschoolSetupService {
  static async inspect(conn: PoolConnection): Promise<SchoolSnapshot> {
    const metadata = await DemoSchemaRepository.maintenanceMetadata(conn);
    const columns = await DemoSchemaRepository.columns(conn);
    for (const column of ['email', 'accessToken', 'image']) {
      if (!columns.some(row => row.tableName === 'passport' && row.columnName === column && row.nullable === 'YES')) throw new Error(`Directory requires nullable passport.${column}`);
    }
    for (const table of ['passport', 'place', 'placePassport', 'placeSchedule', 'project', 'meet', 'idea', 'ideaPhoto', 'demoSeedRecord']) {
      if (!metadata.tables.some(row => String(row.tableName).toLowerCase() === table.toLowerCase() && row.engine === 'InnoDB')) throw new Error(`Transactional table required: ${table}`);
      if (metadata.triggers.some(row => String(row.tableName).toLowerCase() === table.toLowerCase())) throw new Error(`Unreviewed trigger: ${table}`);
    }
    return {
      passport: await PassportRepository.inspectSeedRows(conn), place: await PlaceRepository.inspectSeedRows(conn),
      placePassport: await PlacePassportRepository.inspectSeedRows(conn), placeSchedule: await PlaceScheduleRepository.inspectSeedRows(conn),
      project: await ProjectRepository.inspectSeedRows(conn), meet: await MeetRepository.inspectSeedRows(conn),
      idea: await IdeaRepository.inspectSeedRows(conn), photos: await IdeaPhotoRepository.findByIdeaId(54, conn),
      registry: await DemoSeedRepository.findAll(WSCHOOL_KEY, conn),
    };
  }

  static plan(snapshot: SchoolSnapshot, cover: IdeaPhoto) {
    const registered = (type: 'passport' | 'place' | 'placePassport' | 'placeSchedule' | 'project' | 'meet', key: string): Row | undefined => {
      const record = snapshot.registry.find(row => row.entityType === type && row.entityKey === key);
      if (!record) return undefined;
      const row = snapshot[type].find(row => row.id === record.recordId);
      if (!row) throw new Error(`Registered ${type}/${key} missing; refusing recreation`);
      return row;
    };
    const admin = snapshot.passport.find(row => row.id === 42);
    if (!admin || admin.title !== 'Дмитрий А.' || admin.provider === 'quantum-directory') throw new Error('Expected existing Dmitry A. passport 42');
    const idea = snapshot.idea.find(row => row.id === 54);
    if (!idea || idea.catalogId !== 'toy-001' || idea.deletedAt != null) throw new Error('Expected active toy-001 idea 54');
    const originals = snapshot.photos.filter(photo => photo.id !== cover.id);
    if (originals.length !== 8 || cover.sourcePhotoIds?.toString() !== originals.map(photo => photo.id).toString()) throw new Error('Robot original gallery changed; review before applying');
    const currentCover = snapshot.photos.find(photo => photo.id === cover.id);
    if (currentCover && (!isDeepStrictEqual(currentCover, cover) || idea.image !== cover.url || originals.some(photo => photo.isCover))) throw new Error('Robot cover changed; no overwrite');
    if (!currentCover && snapshot.registry.length) throw new Error('Previously imported cover removed; no overwrite');

    const matches = snapshot.place.filter(row => row.title === school.title && row.address === school.address);
    if (matches.length > 1) throw new Error('Ambiguous existing school');
    const center = registered('place', 'school') ?? matches[0];
    if (center) requireFields(center, { title: school.title, address: school.address, description: school.description, phone: school.phone }, 'School');
    const teachers = schoolTeachers.map(([key, title]) => {
      const providerId = `wschool-${key}`;
      const matches = snapshot.passport.filter(row => row.provider === 'quantum-directory' && row.providerId === providerId);
      if (matches.length > 1) throw new Error(`Ambiguous directory profile: ${key}`);
      const row = registered('passport', key) ?? matches[0];
      if (row) requireFields(row, { provider: 'quantum-directory', providerId, title, email: null, accessToken: null, image: null, description: directoryDescription }, `Teacher ${key}`);
      return { key, title, providerId, row };
    });
    const member = (key: string, passportId: number | undefined, role: 'teacher' | 'admin') => {
      const rows = center && passportId ? snapshot.placePassport.filter(row => row.placeId === center.id && row.passportId === passportId) : [];
      if (rows.length > 1) throw new Error(`Duplicate school membership: ${key}`);
      const row = registered('placePassport', key) ?? rows[0];
      if (row) requireFields(row, { placeId: center?.id, passportId, role }, `Membership ${key}`);
      return row;
    };
    const adminMembership = member('admin', 42, 'admin');
    const memberships = teachers.map(teacher => member(teacher.key, teacher.row ? Number(teacher.row.id) : undefined, 'teacher'));
    const schedule = Array.from({ length: 7 }, (_, weekday) => {
      const rows = center ? snapshot.placeSchedule.filter(row => row.placeId === center.id && row.weekday === weekday) : [];
      if (rows.length > 1) throw new Error(`Duplicate school schedule: ${weekday}`);
      const row = registered('placeSchedule', `day-${weekday}`) ?? rows[0];
      const enabled = weekday > 0 && weekday < 6;
      if (row) requireFields(row, { placeId: center?.id, weekday, enabled: Number(enabled), startTime: '08:00:00', endTime: '18:00:00' }, `Schedule ${weekday}`);
      return { row, weekday, enabled, startTime: '08:00', endTime: '18:00' };
    });
    const project = registered('project', 'robot');
    if (!project && center && snapshot.project.some(row => row.placeId === center.id && row.passportId === 42 && row.ideaId === 54 && row.title === workshopTitle)) throw new Error('Unregistered matching project; review required');
    if (project) requireFields(project, { passportId: 42, placeId: center?.id, ideaId: 54, title: workshopTitle, description: workshopDescription, image: cover.url, deletedAt: null }, 'Project');
    const meets = schoolDates.map(date => {
      const row = registered('meet', date);
      if (row) {
        requireFields(row, { projectId: project?.id, placeId: center?.id, passportId: 42, duration: 60, price: 0, status: 'published', deletedAt: null }, `Meeting ${date}`);
        if (instant(row.startedAt) !== dateStart(date)) throw new Error(`Meeting ${date} moved; no overwrite`);
      }
      return row;
    });
    const ownIds = new Set(meets.map(row => row?.id));
    for (const date of schoolDates) {
      const start = dateStart(date);
      const conflicts = snapshot.meet.filter(row => !ownIds.has(row.id) && row.deletedAt == null && row.status !== 'cancelled'
        && (row.passportId === 42 || center && row.placeId === center.id)
        && instant(row.startedAt) < start + 3600000 && instant(row.startedAt) + Number(row.duration ?? 60) * 60000 > start);
      if (conflicts.length) throw new Error(`Schedule conflict ${date} 16:00 MSK: meetings ${conflicts.map(row => row.id).join(', ')}`);
    }
    return { center, teachers, adminMembership, memberships, schedule, project, meets, currentCover,
      additions: { centers: center ? 0 : 1, teachers: teachers.filter(t => !t.row).length,
        memberships: memberships.filter(row => !row).length + (adminMembership ? 0 : 1),
        scheduleDays: schedule.filter(day => !day.row).length, projects: project ? 0 : 1, meetings: meets.filter(row => !row).length, photos: currentCover ? 0 : 1 } };
  }

  // Caller saves a backup and owns the transaction. Repeated imports only verify.
  static async apply(conn: PoolConnection, snapshot: SchoolSnapshot, cover: IdeaPhoto) {
    const plan = this.plan(snapshot, cover);
    const save = async (entityType: DemoSeedRecord['entityType'], entityKey: string, recordId: number) => {
      if (!snapshot.registry.some(row => row.entityType === entityType && row.entityKey === entityKey)) await DemoSeedRepository.save({ seedKey: WSCHOOL_KEY, entityType, entityKey, recordId }, conn);
      return recordId;
    };
    const placeId = plan.center ? Number(plan.center.id) : await PlaceRepository.create({ ...school, provider: null, providerId: null }, conn);
    if (!plan.center) await PlaceRepository.update(placeId, { phone: school.phone }, conn);
    await save('place', 'school', placeId);
    if (!plan.adminMembership) await save('placePassport', 'admin', await PlacePassportRepository.create({ placeId, passportId: 42, role: 'admin' }, conn));
    else await save('placePassport', 'admin', Number(plan.adminMembership.id));
    for (const [index, teacher] of plan.teachers.entries()) {
      const passportId = teacher.row ? Number(teacher.row.id) : await PassportRepository.create({ provider: 'quantum-directory', providerId: teacher.providerId,
        title: teacher.title, description: directoryDescription, email: null, accessToken: null, image: null }, conn);
      await save('passport', teacher.key, passportId);
      const member = plan.memberships[index];
      await save('placePassport', teacher.key, member ? Number(member.id) : await PlacePassportRepository.create({ placeId, passportId, role: 'teacher' }, conn));
    }
    for (const day of plan.schedule) await save('placeSchedule', `day-${day.weekday}`, day.row ? Number(day.row.id) : await PlaceScheduleRepository.saveSeedDay(undefined, placeId, day, conn));
    if (!plan.currentCover) {
      await IdeaPhotoRepository.replace(54, [cover, ...snapshot.photos.map(photo => ({ ...photo, isCover: false }))], conn);
      await IdeaRepository.update(54, { image: cover.url }, conn);
    }
    const projectId = plan.project ? Number(plan.project.id) : await ProjectRepository.create({ passportId: 42, placeId, ideaId: 54, title: workshopTitle, description: workshopDescription, image: cover.url }, conn);
    await save('project', 'robot', projectId);
    for (const [index, date] of schoolDates.entries()) {
      const existing = plan.meets[index];
      const id = existing ? Number(existing.id) : await MeetRepository.create({ passportId: 42, placeId, projectId, price: 0, duration: 60, startedAt: `${date} 16:00:00` }, conn);
      if (!existing) await MeetRepository.update(id, { status: 'published' }, conn);
      await save('meet', date, id);
    }
    return { placeId, projectId };
  }
}
