import { randomBytes } from 'node:crypto';
import type { PoolConnection } from 'mysql2/promise';
import type { DemoEntity, DemoSeedRecord } from 'entities';
import DemoSeedRepository from '../repositories/demo-seed.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import PaymentRepository from '../repositories/payment.repository.js';
import ConversationRepository from '../repositories/conversation.repository.js';
import ConversationPassportRepository from '../repositories/conversation-passport.repository.js';
import MessageRepository from '../repositories/message2.repository.js';
import { IdeaPhotoRepository } from '../repositories/idea-photo.repository.js';
import IdeaUserRepository from '../repositories/idea-user.repository.js';
import TeacherUserRepository from '../repositories/teacher-user.repository.js';
import PlaceLocationRepository from '../repositories/place-location.repository.js';
import { buildDemoMeetings, DEMO_NOTE, DEMO_SEED_KEY, demoIdeas, demoPlaces, demoProjectDescription, demoProjectTeacherIndex, demoProjectPlaceIndex, demoStudentNames, demoTeachers } from './demo-seed.data.js';

const repositories = {
  passport: PassportRepository, user: UserRepository, place: PlaceRepository,
  placePassport: PlacePassportRepository, placeSchedule: PlaceScheduleRepository,
  idea: IdeaRepository, project: ProjectRepository, meet: MeetRepository,
  projectUser: ProjectUserRepository, meetUser: MeetUserRepository,
};
const externalRepositories = {
  payment: PaymentRepository, conversation: ConversationRepository, conversationPassport: ConversationPassportRepository,
  message2: MessageRepository, ideaPhoto: IdeaPhotoRepository, ideaUser: IdeaUserRepository,
  teacherUser: TeacherUserRepository, placeLocation: PlaceLocationRepository,
};
type SeedRows = Record<string, Record<string, unknown>[]>;
const referenceTargets: Record<string, DemoEntity[]> = {
  passportId: ['passport'], senderPassportId: ['passport'], teacherId: ['passport'], userId: ['user'],
  placeId: ['place'], projectId: ['project'], ideaId: ['idea'], meetId: ['meet'],
};

export function externalDemoReferences(records: DemoSeedRecord[], tables: SeedRows): string[] {
  const ids = new Map<string, Set<number>>();
  for (const record of records) {
    const group = ids.get(record.entityType) ?? new Set<number>();
    group.add(record.recordId);
    ids.set(record.entityType, group);
  }
  const conflicts: string[] = [];
  for (const [table, rows] of Object.entries(tables)) {
    for (const row of rows) {
      if (typeof row.id === 'number' && ids.get(table)?.has(row.id)) continue;
      for (const [column, targets] of Object.entries(referenceTargets)) {
        if (targets.some(target => typeof row[column] === 'number' && ids.get(target)?.has(row[column]))) {
          conflicts.push(`${table}#${String(row.id ?? row.conversationId)}.${column}`);
        }
      }
      if (table === 'payment' && typeof row.targetType === 'string' && typeof row.targetId === 'number' && ids.get(row.targetType)?.has(row.targetId)) {
        conflicts.push(`payment#${String(row.id)}.targetId`);
      }
    }
  }
  return conflicts;
}

export class DemoSeedService {
  private static async transaction<T>(conn: PoolConnection, operation: () => Promise<T>): Promise<T> {
    await conn.beginTransaction();
    try {
      const result = await operation();
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback().catch(() => undefined);
      throw error;
    }
  }

  static seed(conn: PoolConnection, images: Record<string, string>, now = new Date()) {
    return this.transaction(conn, () => this.apply(conn, images, now));
  }

  static removeData(conn: PoolConnection) {
    return this.transaction(conn, () => this.remove(conn));
  }

  static async inspect(conn: PoolConnection) {
    const records = await DemoSeedRepository.findAll(DEMO_SEED_KEY, conn);
    const tables: SeedRows = {};
    for (const [table, repository] of Object.entries({ ...repositories, ...externalRepositories })) {
      tables[table] = await repository.inspectSeedRows(conn);
    }
    for (const record of records) {
      if (!tables[record.entityType]?.some(row => row.id === record.recordId)) throw new Error(`Missing registered demo record: ${record.entityType}/${record.entityKey}`);
    }
    return { records, tables, conflicts: externalDemoReferences(records, tables) };
  }

  static async apply(conn: PoolConnection, images: Record<string, string>, now = new Date()) {
    const { records, tables, conflicts } = await this.inspect(conn);
    if (conflicts.length) throw new Error(`Demo records have external references: ${conflicts.join(', ')}`);
    if (records.some(row => row.entityKey.startsWith('extension/'))) throw new Error('Extension exists; refreshing the base schedule requires review');
    const registered = new Map(records.map(record => [`${record.entityType}/${record.entityKey}`, record.recordId]));
    const image = (key: string): string => {
      const url = images[key];
      if (!url?.startsWith('https://storage.yandexcloud.net/quantum-education/demo/')) throw new Error(`Missing demo S3 image: ${key}`);
      return url;
    };
    const save = async (entityType: DemoEntity, entityKey: string, create: () => Promise<number>, update?: (id: number) => Promise<unknown>): Promise<number> => {
      const key = `${entityType}/${entityKey}`;
      const existing = registered.get(key);
      if (existing !== undefined) {
        if (update) await update(existing);
        return existing;
      }
      const id = await create();
      await DemoSeedRepository.save({ seedKey: DEMO_SEED_KEY, entityType, entityKey, recordId: id }, conn);
      registered.set(key, id);
      return id;
    };
    const passport = async (key: string, title: string, description: string, picture: string | null) => {
      const data = { provider: 'quantum-demo', providerId: `${DEMO_SEED_KEY}:${key}`, accessToken: randomBytes(48).toString('hex'), email: `${key}@example.invalid`, title, description, image: picture };
      return save('passport', key, () => PassportRepository.create(data, conn), id => PassportRepository.update(id, { title, description, image: picture }, conn));
    };
    const teachers: number[] = [];
    for (const [index, teacher] of demoTeachers.entries()) teachers.push(await passport(`teacher-${index + 1}`, teacher.title, `${teacher.description} Вымышленный демонстрационный профиль.`, image(`teacher-${index + 1}`)));
    const parents: number[] = [];
    for (let index = 0; index < 12; index++) parents.push(await passport(`parent-${index + 1}`, `Семья ${index + 1}`, 'Вымышленный демонстрационный аккаунт родителя.', null));
    const students: number[] = [];
    for (const [index, title] of demoStudentNames.entries()) {
      const data = { passportId: parents[Math.floor(index / 2)], title, age: 8 + index % 5, description: 'Вымышленный участник демонстрационных мастерских.' };
      students.push(await save('user', `student-${index + 1}`, () => UserRepository.create(data, conn), id => UserRepository.update(id, { title, age: data.age }, conn)));
    }
    const places: number[] = [];
    for (const [index, place] of demoPlaces.entries()) {
      const data = { ...place, provider: 'quantum-demo', providerId: index + 1 };
      const update = { ...data, image: image(`centre-${index + 1}`), priceFrom: 600 };
      const id = await save('place', `centre-${index + 1}`, async () => {
        const created = await PlaceRepository.create(data, conn);
        await PlaceRepository.update(created, update, conn);
        return created;
      }, existing => PlaceRepository.update(existing, update, conn));
      places.push(id);
      const admin = await passport(`admin-${index + 1}`, `Администратор «${place.title}»`, 'Вымышленный демонстрационный администратор центра.', null);
      await save('placePassport', `admin-${index + 1}`, () => PlacePassportRepository.create({ passportId: admin, placeId: id, role: 'admin' }, conn));
      for (let weekday = 0; weekday < 7; weekday++) {
        const day = { weekday, enabled: true, startTime: '09:00', endTime: '20:00' };
        await save('placeSchedule', `centre-${index + 1}/day-${weekday}`, () => PlaceScheduleRepository.saveSeedDay(undefined, id, day, conn), existing => PlaceScheduleRepository.saveSeedDay(existing, id, day, conn));
      }
    }
    const ideas: number[] = [];
    for (const [index, idea] of demoIdeas.entries()) {
      const catalogId = `demo-${DEMO_SEED_KEY}-${idea.key}`;
      if (tables.idea.some(row => row.catalogId === catalogId && !registered.has(`idea/${idea.key}`))) throw new Error(`Unregistered demo catalog ID: ${catalogId}`);
      const data = {
        title: idea.title, description: `${idea.detail}\n\n${idea.skill}. Возраст демонстрационной программы: ${idea.age}.\n\n${DEMO_NOTE}`,
        image: image(idea.key), catalogId, passportId: teachers[demoProjectTeacherIndex(index)], userId: students[index],
        cardData: { demo: true, age: idea.age, skills: idea.skill }, catalogMetadata: { demo: true, seedKey: DEMO_SEED_KEY, imageSource: 'AI-generated demonstration' },
      };
      ideas.push(await save('idea', idea.key, () => IdeaRepository.create(data, conn), id => IdeaRepository.update(id, data, conn)));
    }
    const catalog = ['toy-001', 'toy-002', 'toy-003', 'toy-004'].map(key => {
      const row = tables.idea.find(item => item.catalogId === key && item.deletedAt === null);
      if (!row || typeof row.id !== 'number' || typeof row.title !== 'string' || typeof row.image !== 'string' || !row.image.startsWith('https://storage.yandexcloud.net/quantum-education/')) throw new Error(`Catalog idea with S3 cover required: ${key}`);
      return { id: row.id, title: row.title, image: row.image };
    });
    const projects: number[] = [];
    const participants: number[][] = [];
    for (let index = 0; index < 18; index++) {
      const research = index >= 12 && index < 16;
      const source = research ? catalog[index - 12] : null;
      const ideaIndex = index < 12 ? index : index - 16;
      const title = source ? `Исследуем конструкцию: ${source.title}` : `${demoIdeas[ideaIndex].title}${index >= 16 ? ' — семейная мастерская' : ''}`;
      const teacherIndex = demoProjectTeacherIndex(index);
      const placeIndex = demoProjectPlaceIndex(index);
      const data = { title, description: demoProjectDescription(research ? index : ideaIndex, research), image: source?.image ?? image(demoIdeas[ideaIndex].key), ideaId: source?.id ?? ideas[ideaIndex], passportId: teachers[teacherIndex], placeId: places[placeIndex] };
      const id = await save('project', `project-${index + 1}`, () => ProjectRepository.create(data, conn), existing => ProjectRepository.update(existing, data, conn));
      projects.push(id);
      await save('placePassport', `teacher-${teacherIndex + 1}/centre-${placeIndex + 1}`, () => PlacePassportRepository.create({ passportId: data.passportId, placeId: data.placeId, role: 'teacher' }, conn));
      const group = Array.from({ length: 4 + index % 5 }, (_, position) => students[(index * 3 + position) % students.length]);
      participants.push(group);
      for (const userId of group) await save('projectUser', `project-${index + 1}/student-${students.indexOf(userId) + 1}`, () => ProjectUserRepository.create({ projectId: id, userId }, conn));
    }
    for (const meeting of buildDemoMeetings(now)) {
      const index = meeting.projectIndex;
      const startedAt = new Date(new Date(meeting.startedAt).getTime() + 3 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
      const data = { projectId: projects[index], placeId: places[demoProjectPlaceIndex(index)], passportId: teachers[demoProjectTeacherIndex(index)], price: meeting.price, duration: meeting.duration, startedAt };
      const id = await save('meet', meeting.key, async () => {
        const created = await MeetRepository.create(data, conn);
        await MeetRepository.update(created, { status: 'published' }, conn);
        return created;
      }, existing => MeetRepository.update(existing, { price: data.price, duration: data.duration, startedAt: data.startedAt, status: 'published' }, conn));
      for (const userId of participants[index].slice(0, 3 + index % 2)) await save('meetUser', `${meeting.key}/student-${students.indexOf(userId) + 1}`, () => MeetUserRepository.create({ meetId: id, userId }, conn));
    }
    return this.report(await DemoSeedRepository.findAll(DEMO_SEED_KEY, conn));
  }

  static report(records: DemoSeedRecord[]) {
    const counts: Partial<Record<DemoEntity, number>> = {};
    for (const record of records) counts[record.entityType] = (counts[record.entityType] ?? 0) + 1;
    return { seedKey: DEMO_SEED_KEY, counts, links: records.filter(row => ['idea', 'project', 'place'].includes(row.entityType) || row.entityType === 'passport' && row.entityKey.startsWith('teacher-')).map(row => ({ key: row.entityKey, path: `/${row.entityType === 'passport' ? 'teachers' : row.entityType === 'place' ? 'places' : row.entityType}/${row.recordId}` })) };
  }

  static async remove(conn: PoolConnection) {
    const { records, conflicts } = await this.inspect(conn);
    if (conflicts.length) throw new Error(`Removal blocked by external references: ${conflicts.join(', ')}`);
    const order: DemoEntity[] = ['meetUser', 'projectUser', 'meet', 'project', 'idea', 'placeSchedule', 'placePassport', 'user', 'place', 'passport'];
    for (const table of order) await repositories[table].removeSeedRows(records.filter(record => record.entityType === table).map(record => record.recordId), conn);
    await DemoSeedRepository.clear(DEMO_SEED_KEY, conn);
    return this.report(records);
  }
}
