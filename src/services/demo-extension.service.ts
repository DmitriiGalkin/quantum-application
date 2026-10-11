import { randomBytes } from 'node:crypto';
import type { PoolConnection } from 'mysql2/promise';
import type { DemoEntity } from 'entities';
import { DemoSeedService } from './demo-seed.service.js';
import DemoSeedRepository from '../repositories/demo-seed.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import UserRepository from '../repositories/user.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import { DEMO_NOTE, DEMO_SEED_KEY, demoProjectPlaceIndex, demoProjectTeacherIndex } from './demo-seed.data.js';
import { extensionIdeas, extensionPrefix, extensionStudentNames, extensionTeacherPlaceSources } from './demo-extension.data.js';

type Row = Record<string, unknown>;
export interface OccupiedSlot { start: number; duration: number; teacherId: number; placeId: number; students: number[] }
export interface OpeningDay { placeId: number; weekday: number; enabled: boolean; startTime: string; endTime: string }

/** Dates are UTC instants; DB writes use Moscow wall time explicitly. */
export function findExtensionSlot(now: Date, earliestDay: number, teacherId: number, placeId: number, students: number[], openings: OpeningDay[], occupied: OccupiedSlot[]): number {
  const moscow = new Date(now.getTime() + 3 * 3600000);
  const midnight = Date.UTC(moscow.getUTCFullYear(), moscow.getUTCMonth(), moscow.getUTCDate());
  for (let day = earliestDay; day <= 41; day++) {
    const date = new Date(midnight + day * 86400000);
    const opening = openings.find(row => row.placeId === placeId && row.weekday === date.getUTCDay() && row.enabled);
    if (!opening) continue;
    for (let hour = 9; hour <= 18; hour++) {
      if (`${String(hour).padStart(2, '0')}:00:00` < opening.startTime || `${String(hour + 1).padStart(2, '0')}:30:00` > opening.endTime) continue;
      const start = date.getTime() + (hour - 3) * 3600000;
      if (start <= now.getTime()) continue;
      const collision = occupied.some(slot => (slot.teacherId === teacherId || slot.placeId === placeId || slot.students.some(id => students.includes(id))) && start < slot.start + slot.duration * 60000 && start + 90 * 60000 > slot.start);
      if (!collision) return start;
    }
  }
  throw new Error('No free slot within the next six Moscow weeks');
}

export const extensionExpectedCounts = { passport: 10, user: 20, idea: 10, project: 15, projectUser: 90, meet: 33, meetUser: 114 };

export class DemoExtensionService {
  static async apply(conn: PoolConnection, images: Record<string, string>, now = new Date()) {
    const { records, tables } = await DemoSeedService.inspect(conn);
    const registered = new Map(records.map(record => [`${record.entityType}/${record.entityKey}`, record.recordId]));
    const added = records.filter(row => row.entityKey.startsWith(extensionPrefix));
    if (added.length) {
      this.verify(added, tables);
      return { alreadyPresent: true, counts: DemoSeedService.report(added).counts };
    }
    const required = (type: DemoEntity, key: string) => {
      const id = registered.get(`${type}/${key}`);
      const row = tables[type].find(row => row.id === id);
      if (id === undefined || !row || row.deletedAt != null) throw new Error(`Existing demo dependency missing: ${type}/${key}`);
      if (type === 'passport' && (row.provider !== 'quantum-demo' || id === 42)) throw new Error('Demo teacher required');
      if (type === 'place' && row.provider !== 'quantum-demo') throw new Error('Demo centre required');
      return id;
    };
    const save = async (entityType: DemoEntity, key: string, create: () => Promise<number>) => {
      const entityKey = extensionPrefix + key;
      const id = await create();
      await DemoSeedRepository.save({ seedKey: DEMO_SEED_KEY, entityType, entityKey, recordId: id }, conn);
      return id;
    };
    const parents: number[] = [];
    for (let index = 0; index < 10; index++) {
      const key = `family-${index + 1}`;
      const providerId = `${DEMO_SEED_KEY}:${extensionPrefix}${key}`;
      if (tables.passport.some(row => row.provider === 'quantum-demo' && row.providerId === providerId)) throw new Error('Unregistered extension family');
      parents.push(await save('passport', key, () => PassportRepository.create({ provider: 'quantum-demo', providerId, accessToken: randomBytes(48).toString('hex'), email: `extension-family-${index + 1}@example.invalid`, title: `Демонстрационная семья ${index + 13}`, description: 'Вымышленный семейный аккаунт дополнительного демонабора Quantum.', image: null }, conn)));
    }
    const students: number[] = [];
    for (const [index, title] of extensionStudentNames.entries()) students.push(await save('user', `student-${index + 1}`, () => UserRepository.create({ passportId: parents[Math.floor(index / 2)], title, age: 8 + index % 5, description: 'Вымышленный участник дополнительного демонабора.' }, conn)));
    const ideas: number[] = [];
    for (const [index, idea] of extensionIdeas.entries()) {
      const catalogId = `demo-${DEMO_SEED_KEY}-extension-${idea.key}`;
      if (tables.idea.some(row => row.catalogId === catalogId)) throw new Error(`Unregistered extension catalog ID: ${catalogId}`);
      const image = images[idea.key];
      if (!image?.startsWith(`https://storage.yandexcloud.net/quantum-education/demo/${DEMO_SEED_KEY}/extension/`)) throw new Error(`Missing extension image: ${idea.key}`);
      const teacherIndex = demoProjectTeacherIndex(extensionTeacherPlaceSources[index]);
      ideas.push(await save('idea', idea.key, () => IdeaRepository.create({ title: idea.title, description: `${idea.detail}\n\n${idea.skill}. Программа для 8–12 лет.\n\n${DEMO_NOTE}`, passportId: required('passport', `teacher-${teacherIndex + 1}`), userId: students[index], image, catalogId, cardData: { demo: true, age: '8–12 лет', skills: idea.skill }, catalogMetadata: { demo: true, seedKey: DEMO_SEED_KEY, extension: true, imageSource: 'AI-generated demonstration' } }, conn)));
    }
    const projects: { id: number; teacherId: number; placeId: number; students: number[] }[] = [];
    for (let index = 0; index < 15; index++) {
      const ideaIndex = index < 10 ? index : index - 10, idea = extensionIdeas[ideaIndex];
      const source = extensionTeacherPlaceSources[index];
      const teacherId = required('passport', `teacher-${demoProjectTeacherIndex(source) + 1}`);
      const placeId = required('place', `centre-${demoProjectPlaceIndex(source) + 1}`);
      if (!tables.placePassport.some(row => row.passportId === teacherId && row.placeId === placeId && row.role === 'teacher')) throw new Error('Teacher is not assigned to the demo centre');
      const group = Array.from({ length: 4 + index % 5 }, (_, offset) => students[(index * 3 + offset) % students.length]);
      const id = await save('project', `project-${index + 1}`, () => ProjectRepository.create({ title: `${idea.title}${index >= 10 ? ' — исследовательская мастерская' : ''}`, description: `${idea.detail}\n\n1. Сделаем набросок и обсудим устройство.\n2. Соберём прототип из подготовленных материалов под контролем мастера.\n3. Проверим результат и расскажем об открытиях.\n\n${idea.skill}. Возраст 8–12 лет. Материалы включены.\n\n${DEMO_NOTE}`, image: images[idea.key], passportId: teacherId, placeId, ideaId: ideas[ideaIndex] }, conn));
      projects.push({ id, teacherId, placeId, students: group });
      for (const userId of group) await save('projectUser', `project-${index + 1}/student-${students.indexOf(userId) + 1}`, () => ProjectUserRepository.create({ projectId: id, userId }, conn));
    }
    const occupied: OccupiedSlot[] = tables.meet.filter(row => row.deletedAt === null && row.status !== 'cancelled' && row.startedAt != null).map(row => ({ start: new Date(String(row.startedAt)).getTime(), duration: Number(row.duration) || 120, teacherId: Number(row.passportId), placeId: Number(row.placeId), students: tables.meetUser.filter(item => item.meetId === row.id).map(item => Number(item.userId)) }));
    const openings: OpeningDay[] = tables.placeSchedule.map(row => ({ placeId: Number(row.placeId), weekday: Number(row.weekday), enabled: Boolean(row.enabled), startTime: String(row.startTime), endTime: String(row.endTime) }));
    for (let index = 0; index < 33; index++) {
      const projectIndex = index % 15, project = projects[projectIndex];
      const group = project.students.slice(0, 3 + projectIndex % 2);
      const start = findExtensionSlot(now, 1 + Math.floor(index / 15) * 7, project.teacherId, project.placeId, group, openings, occupied);
      occupied.push({ start, duration: 90, teacherId: project.teacherId, placeId: project.placeId, students: group });
      const startedAt = new Date(start + 3 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
      const id = await save('meet', `meet-${index + 1}`, async () => {
        const id = await MeetRepository.create({ projectId: project.id, passportId: project.teacherId, placeId: project.placeId, duration: 90, price: 700 + projectIndex % 5 * 150, startedAt }, conn);
        await MeetRepository.update(id, { status: 'published' }, conn);
        return id;
      });
      for (const userId of group) await save('meetUser', `meet-${index + 1}/student-${students.indexOf(userId) + 1}`, () => MeetUserRepository.create({ meetId: id, userId }, conn));
    }
    const after = await DemoSeedService.inspect(conn);
    const extensions = after.records.filter(row => row.entityKey.startsWith(extensionPrefix));
    this.verify(extensions, after.tables);
    return { alreadyPresent: false, counts: DemoSeedService.report(extensions).counts };
  }

  static verify(records: Awaited<ReturnType<typeof DemoSeedRepository.findAll>>, tables: Record<string, Row[]>) {
    const counts = DemoSeedService.report(records).counts;
    for (const [type, expected] of Object.entries(extensionExpectedCounts)) if (counts[type as DemoEntity] !== expected) throw new Error(`Unexpected extension count: ${type}`);
    const ids = (type: DemoEntity) => records.filter(row => row.entityType === type).map(row => row.recordId);
    for (const record of records) if (!tables[record.entityType]?.some(row => row.id === record.recordId)) throw new Error(`Missing extension row: ${record.entityKey}`);
    const ideaRows = tables.idea.filter(row => ids('idea').includes(Number(row.id)));
    for (const [index, idea] of extensionIdeas.entries()) {
      const row = ideaRows.find(row => row.catalogId === `demo-${DEMO_SEED_KEY}-extension-${idea.key}`);
      if (!row || row.deletedAt != null || typeof row.image !== 'string' || !row.image.startsWith(`https://storage.yandexcloud.net/quantum-education/demo/${DEMO_SEED_KEY}/extension/`)) throw new Error(`Invalid extension idea: ${idea.key}`);
      if (tables.project.filter(item => ids('project').includes(Number(item.id)) && item.ideaId === row.id).length !== (index < 5 ? 2 : 1)) throw new Error(`Invalid implementation count: ${idea.key}`);
    }
    for (const row of tables.project.filter(row => ids('project').includes(Number(row.id)))) {
      const count = tables.projectUser.filter(item => item.projectId === row.id).length;
      if (row.passportId === 42 || row.deletedAt != null || count < 4 || count > 8) throw new Error('Invalid extension project');
      if (row.image !== ideaRows.find(idea => idea.id === row.ideaId)?.image) throw new Error('Project image must match its idea');
      if (!tables.passport.some(item => item.id === row.passportId && item.provider === 'quantum-demo') || !tables.place.some(item => item.id === row.placeId && item.provider === 'quantum-demo') || !tables.placePassport.some(item => item.passportId === row.passportId && item.placeId === row.placeId && item.role === 'teacher')) throw new Error('Existing demo teacher and centre required');
    }
    for (const row of tables.meet.filter(row => ids('meet').includes(Number(row.id)))) {
      const count = tables.meetUser.filter(item => item.meetId === row.id).length;
      if (row.status !== 'published' || row.deletedAt != null || count < 3 || count > 4) throw new Error('Invalid extension meeting');
      const project = tables.project.find(item => item.id === row.projectId);
      if (!project || project.passportId !== row.passportId || project.placeId !== row.placeId) throw new Error('Meeting does not match its project');
      const students = tables.meetUser.filter(item => item.meetId === row.id).map(item => Number(item.userId));
      if (new Set(students).size !== students.length || students.some(id => !tables.projectUser.some(item => item.projectId === row.projectId && item.userId === id))) throw new Error('Meeting participants must belong to the project');
      const start = new Date(String(row.startedAt)).getTime(), duration = Number(row.duration);
      if (!Number.isFinite(start) || duration !== 90) throw new Error('Invalid meeting time');
      const local = new Date(start + 3 * 3600000);
      const time = local.toISOString().slice(11, 19);
      const end = new Date(start + (3 * 60 + duration) * 60000).toISOString().slice(11, 19);
      if (!tables.placeSchedule.some(item => item.placeId === row.placeId && item.weekday === local.getUTCDay() && Boolean(item.enabled) && time >= String(item.startTime) && end <= String(item.endTime))) throw new Error('Meeting outside centre schedule');
      for (const other of tables.meet.filter(item => item.id !== row.id && item.deletedAt === null && item.status !== 'cancelled' && item.startedAt != null)) {
        const otherStart = new Date(String(other.startedAt)).getTime();
        const shared = other.passportId === row.passportId || other.placeId === row.placeId || tables.meetUser.some(item => item.meetId === other.id && students.includes(Number(item.userId)));
        if (shared && start < otherStart + (Number(other.duration) || 120) * 60000 && start + duration * 60000 > otherStart) throw new Error('Extension schedule collision');
      }
    }
    return counts;
  }
}
