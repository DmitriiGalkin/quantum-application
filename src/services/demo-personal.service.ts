import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import type { DemoEntity } from '../entities/demo-seed.js';
import DemoSeedRepository from '../repositories/demo-seed.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import { DEMO_NOTE, DEMO_SEED_KEY, demoIdeas } from './demo-seed.data.js';

const passportId = 42, userId = 1, placeId = 575;
const seedKey = 'quantum-passport-42-v1';
const repositories = { passport: PassportRepository, user: UserRepository, placePassport: PlacePassportRepository,
  placeSchedule: PlaceScheduleRepository, idea: IdeaRepository, project: ProjectRepository, meet: MeetRepository,
  projectUser: ProjectUserRepository, meetUser: MeetUserRepository };

export class PersonalDemoService {
  static async run(conn: mysql.PoolConnection, apply: boolean) {
    const tables: Record<string, Record<string, unknown>[]> = {};
    for (const [table, repository] of Object.entries(repositories)) tables[table] = await repository.inspectSeedRows(conn);
    if (!tables.passport.some(row => row.id === passportId && row.title === 'Дмитрий А.') ||
        !tables.user.some(row => row.id === userId && row.passportId === passportId && row.deletedAt === null) ||
        !tables.placePassport.some(row => row.passportId === passportId && row.placeId === placeId && row.role === 'admin')) {
      throw new Error('Account relationships have changed; no data written');
    }
    const records = await DemoSeedRepository.findAll(seedKey, conn);
    const ideas = ['boat', 'robot', 'lantern'].map(key => {
      const idea = demoIdeas.find(item => item.key === key);
      const shared = tables.idea.find(row => row.catalogId === `demo-${DEMO_SEED_KEY}-${key}` && row.deletedAt === null);
      if (!idea || !shared || typeof shared.image !== 'string' || !shared.image.trim()) throw new Error('Shared demo idea with image required');
      if (tables.idea.some(row => row.catalogId === `${seedKey}-${key}`)) throw new Error('Merge personal idea copies first');
      return { ...idea, id: Number(shared.id), image: shared.image };
    });
    if (records.length) {
      if (records.length !== 69 || records.some(record => !tables[record.entityType]?.some(row => row.id === record.recordId))) {
        throw new Error('Personal demo set is incomplete; manual inspection required');
      }
      for (const record of records.filter(row => row.entityType === 'project')) {
        const project = tables.project.find(row => row.id === record.recordId);
        if (project?.ideaId !== ideas.find(row => row.key === record.entityKey)?.id) throw new Error('Personal project must reference the shared catalog');
      }
      return { alreadyPresent: true, records: records.length, projects: records.filter(row => row.entityType === 'project').map(row => row.recordId) };
    }
    const ownMeetIds = new Set(tables.meetUser.filter(row => row.userId === userId).map(row => row.meetId));
    const occupied = tables.meet.filter(row => row.deletedAt === null && row.status !== 'cancelled' &&
      (row.passportId === passportId || row.placeId === placeId || ownMeetIds.has(row.id))).map(row => ({
        start: new Date(String(row.startedAt)).getTime(), duration: typeof row.duration === 'number' ? row.duration : 120,
      }));
    const slots: string[] = [];
    const tomorrow = new Date(Date.now() + 3 * 3600000); tomorrow.setUTCHours(0, 0, 0, 0);
    for (let day = 1; day <= 28 && slots.length < 6; day++) {
      const date = new Date(tomorrow.getTime() + day * 86400000);
      const schedule = tables.placeSchedule.find(row => row.placeId === placeId && row.weekday === date.getUTCDay() && row.enabled === 1);
      if (!schedule) continue;
      let daily = 0;
      for (const hour of [11, 13, 15, 17]) {
        const startTime = `${String(hour).padStart(2, '0')}:00:00`;
        const endTime = `${String(hour + 1).padStart(2, '0')}:30:00`;
        if (startTime < String(schedule.startTime) || endTime > String(schedule.endTime)) continue;
        const start = date.getTime() + (hour - 3) * 3600000;
        if (occupied.some(item => start < item.start + item.duration * 60000 && start + 90 * 60000 > item.start)) continue;
        slots.push(`${date.toISOString().slice(0, 10)} ${startTime}`);
        occupied.push({ start, duration: 90 });
        if (++daily === 2 || slots.length === 6) break;
      }
    }
    if (slots.length !== 6) throw new Error('Six free meeting slots unavailable');
    if (!apply) return { preview: true, passportId, userId, placeId, ideas: ideas.map(row => row.title), projects: 3, students: 6, meetings: slots };
    const save = async (entityType: DemoEntity, entityKey: string, create: () => Promise<number>) => {
      const id = await create();
      await DemoSeedRepository.save({ seedKey, entityType, entityKey, recordId: id }, conn);
      return id;
    };
    const parentId = await save('passport', 'demo-family', () => PassportRepository.create({
      provider: 'quantum-demo', providerId: `${seedKey}:family`, accessToken: randomBytes(48).toString('hex'),
      email: 'passport-42-demo-family@example.invalid', title: 'Демонстрационная семья мастерской',
      description: 'Вымышленный аккаунт для тестовых участников мастерской Дмитрия.', image: null,
    }, conn));
    const students = [userId];
    for (const [index, title] of ['Алиса', 'Марк', 'София', 'Артём', 'Миша'].entries()) {
      students.push(await save('user', `student-${index + 1}`, () => UserRepository.create({
        passportId: parentId, title, age: 8 + index, description: 'Вымышленный участник тестовой мастерской Дмитрия.',
      }, conn)));
    }
    const projects: number[] = [];
    for (const idea of ideas) {
      const description = `${idea.detail}\n\n${idea.skill}. Программа для ${idea.age}.\n\n${DEMO_NOTE}`;
      const projectId = await save('project', idea.key, () => ProjectRepository.create({
        title: idea.title, description: `${description}\n\nДве встречи: знакомимся с материалами, собираем изделие и показываем результат.`,
        image: idea.image, passportId, placeId, ideaId: idea.id,
      }, conn));
      projects.push(projectId);
      for (const studentId of students) await save('projectUser', `${idea.key}/user-${studentId}`, () => ProjectUserRepository.create({ projectId, userId: studentId }, conn));
    }
    const meets: number[] = [];
    for (const [index, startedAt] of slots.entries()) {
      const meetId = await save('meet', `meeting-${index + 1}`, async () => {
        const id = await MeetRepository.create({ passportId, placeId, projectId: projects[index % 3], duration: 90, price: [900, 1100, 800][index % 3], startedAt }, conn);
        await MeetRepository.update(id, { status: 'published' }, conn);
        return id;
      });
      meets.push(meetId);
      for (const studentId of students) await save('meetUser', `meeting-${index + 1}/user-${studentId}`, () => MeetUserRepository.create({ meetId, userId: studentId }, conn));
    }
    return { passportId, userId, placeId, projects, meets, students, meetings: slots, records: (await DemoSeedRepository.findAll(seedKey, conn)).length };
  }
}
