import { createHash } from 'node:crypto';
import type { PoolConnection } from 'mysql2/promise';
import IdeaRepository from '../repositories/idea.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import IdeaUserRepository from '../repositories/idea-user.repository.js';
import { IdeaPhotoRepository } from '../repositories/idea-photo.repository.js';
import PaymentRepository from '../repositories/payment.repository.js';
import DemoSeedRepository from '../repositories/demo-seed.repository.js';
import DemoSchemaRepository from '../repositories/demo-schema.repository.js';
import { DEMO_SEED_KEY } from './demo-seed.data.js';

export const personalSeedKey = 'quantum-passport-42-v1';
export const cleanupIdeaIds = [33, 35, 13, 41, 12, 32, 50, 51, 46];
type Row = Record<string, unknown>;
export interface CleanupTarget { id: number; fingerprint: string }
export interface CleanupManifest { database: string; ideas: CleanupTarget[]; projects: CleanupTarget[] }
export interface MaintenanceSnapshot {
  idea: Row[]; project: Row[]; meet: Row[]; meetUser: Row[]; projectUser: Row[];
  ideaUser: Row[]; ideaPhoto: Row[]; payment: Row[]; demoSeedRecord: Row[];
}
const repositories = {
  idea: IdeaRepository, project: ProjectRepository, meet: MeetRepository, meetUser: MeetUserRepository,
  projectUser: ProjectUserRepository, ideaUser: IdeaUserRepository, ideaPhoto: IdeaPhotoRepository,
  payment: PaymentRepository, demoSeedRecord: DemoSeedRepository,
};
const ids = (rows: Row[]) => rows.map(row => Number(row.id));
export const blankImage = (row: Row) => row.image == null || typeof row.image === 'string' && row.image.trim() === '';
export function rowFingerprint(row: Row): string {
  return createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.keys(row).sort().map(key => [key, row[key]])))).digest('hex');
}

export class DemoMaintenanceService {
  static async inspect(conn: PoolConnection): Promise<MaintenanceSnapshot> {
    const columns = await DemoSchemaRepository.columns(conn);
    const metadata = await DemoSchemaRepository.maintenanceMetadata(conn);
    const allowed = new Set(['project.ideaid', 'meet.projectid', 'projectuser.projectid', 'meetuser.meetid', 'ideauser.ideaid', 'ideaphoto.ideaid', 'payment.targetid']);
    for (const column of columns) {
      if (['ideaId', 'projectId', 'meetId', 'targetId'].includes(column.columnName) && !allowed.has(`${column.tableName}.${column.columnName}`.toLowerCase())) throw new Error(`Unreviewed reference: ${column.tableName}.${column.columnName}`);
    }
    for (const ref of metadata.references) {
      if (['idea', 'project', 'meet'].includes(String(ref.target).toLowerCase()) && !allowed.has(`${String(ref.tableName)}.${String(ref.columnName)}`.toLowerCase())) throw new Error('Unreviewed foreign key');
    }
    for (const table of Object.keys(repositories)) {
      if (!metadata.tables.some(row => String(row.tableName).toLowerCase() === table.toLowerCase() && row.engine === 'InnoDB')) throw new Error(`Transactional table required: ${table}`);
      if (metadata.triggers.some(row => String(row.tableName).toLowerCase() === table.toLowerCase())) throw new Error(`Unreviewed trigger: ${table}`);
    }
    return {
      idea: await IdeaRepository.inspectSeedRows(conn), project: await ProjectRepository.inspectSeedRows(conn),
      meet: await MeetRepository.inspectSeedRows(conn), meetUser: await MeetUserRepository.inspectSeedRows(conn),
      projectUser: await ProjectUserRepository.inspectSeedRows(conn), ideaUser: await IdeaUserRepository.inspectSeedRows(conn),
      ideaPhoto: await IdeaPhotoRepository.inspectSeedRows(conn), payment: await PaymentRepository.inspectSeedRows(conn),
      demoSeedRecord: await DemoSeedRepository.inspectSeedRows(conn),
    };
  }

  static manifest(snapshot: MaintenanceSnapshot, database: string): CleanupManifest {
    const ideas = snapshot.idea.filter(row => cleanupIdeaIds.includes(Number(row.id)) || blankImage(row));
    const ideaIds = new Set(ids(ideas));
    const projects = snapshot.project.filter(row => ideaIds.has(Number(row.ideaId)) || blankImage(row));
    const targets = (rows: Row[]) => rows.map(row => ({ id: Number(row.id), fingerprint: rowFingerprint(row) }));
    return { database, ideas: targets(ideas), projects: targets(projects) };
  }

  static cleanupRows(snapshot: MaintenanceSnapshot, manifest: CleanupManifest): MaintenanceSnapshot {
    const select = (rows: Row[], targets: CleanupTarget[]) => targets.flatMap(target => {
      const row = rows.find(item => item.id === target.id);
      if (!row) return [];
      if (rowFingerprint(row) !== target.fingerprint) throw new Error(`Cleanup target changed: ${target.id}`);
      return [row];
    });
    const idea = select(snapshot.idea, manifest.ideas), project = select(snapshot.project, manifest.projects);
    const ideaIds = new Set(ids(idea)), projectIds = new Set(ids(project));
    if (snapshot.project.some(row => ideaIds.has(Number(row.ideaId)) && !projectIds.has(Number(row.id)))) throw new Error('New project references a cleanup idea; review required');
    const meet = snapshot.meet.filter(row => projectIds.has(Number(row.projectId)));
    const meetIds = new Set(ids(meet));
    const paymentTargets: Record<string, Set<number>> = { idea: ideaIds, project: projectIds, meet: meetIds };
    const removed = {
      idea, project, meet,
      meetUser: snapshot.meetUser.filter(row => meetIds.has(Number(row.meetId))),
      projectUser: snapshot.projectUser.filter(row => projectIds.has(Number(row.projectId))),
      ideaUser: snapshot.ideaUser.filter(row => ideaIds.has(Number(row.ideaId))),
      ideaPhoto: snapshot.ideaPhoto.filter(row => ideaIds.has(Number(row.ideaId))),
      payment: snapshot.payment.filter(row => paymentTargets[String(row.targetType)]?.has(Number(row.targetId))),
      demoSeedRecord: [] as Row[],
    };
    removed.demoSeedRecord = snapshot.demoSeedRecord.filter(row => {
      const rows = removed[row.entityType as keyof typeof removed];
      return rows?.some(item => item.id === row.recordId);
    });
    return removed;
  }

  static counts(rows: MaintenanceSnapshot) {
    return Object.fromEntries(Object.entries(rows).map(([table, items]) => [table, items.length]));
  }

  // Caller owns the transaction and must persist this exact snapshot before applying.
  static async cleanup(conn: PoolConnection, rows: MaintenanceSnapshot): Promise<void> {
    await PaymentRepository.removeSeedRows(ids(rows.payment), conn);
    await MeetUserRepository.removeSeedRows(ids(rows.meetUser), conn);
    await ProjectUserRepository.removeSeedRows(ids(rows.projectUser), conn);
    await IdeaUserRepository.removeSeedRows(ids(rows.ideaUser), conn);
    await IdeaPhotoRepository.removeSeedRows(rows.ideaPhoto.map(row => String(row.id)), conn);
    for (const row of rows.demoSeedRecord) await DemoSeedRepository.removeRecord(String(row.entityType), Number(row.recordId), conn);
    await MeetRepository.removeSeedRows(ids(rows.meet), conn);
    await ProjectRepository.removeSeedRows(ids(rows.project), conn);
    await IdeaRepository.removeSeedRows(ids(rows.idea), conn);
  }

  static mergePairs(snapshot: MaintenanceSnapshot) {
    return ['boat', 'robot', 'lantern'].flatMap(key => {
      const source = snapshot.idea.find(row => row.catalogId === `${personalSeedKey}-${key}`);
      const target = snapshot.idea.find(row => row.catalogId === `demo-${DEMO_SEED_KEY}-${key}` && row.deletedAt === null);
      if (!source) return [];
      if (!target) throw new Error(`Shared catalog idea missing: ${key}`);
      return [{ key, sourceId: Number(source.id), targetId: Number(target.id) }];
    });
  }

  static async merge(conn: PoolConnection, snapshot: MaintenanceSnapshot): Promise<void> {
    for (const pair of this.mergePairs(snapshot)) {
      for (const project of snapshot.project.filter(row => row.ideaId === pair.sourceId)) await ProjectRepository.moveSeedIdea(Number(project.id), pair.targetId, conn);
      const likes = new Set(snapshot.ideaUser.filter(row => row.ideaId === pair.targetId).map(row => row.userId));
      for (const like of snapshot.ideaUser.filter(row => row.ideaId === pair.sourceId)) {
        if (likes.has(like.userId)) {
          await DemoSeedRepository.removeRecord('ideaUser', Number(like.id), conn);
          await IdeaUserRepository.removeSeedRows([Number(like.id)], conn);
        }
        else { await IdeaUserRepository.moveSeedLike(Number(like.id), pair.targetId, conn); likes.add(like.userId); }
      }
      const photos = snapshot.ideaPhoto.filter(row => row.ideaId === pair.targetId);
      const identity = (row: Row) => {
        const photo = typeof row.photoData === 'string' ? JSON.parse(row.photoData) as Row : row.photoData as Row;
        return String(photo.driveFileId || photo.url || photo.id || row.id);
      };
      const seen = new Set(photos.map(identity));
      let position = Math.max(-1, ...photos.map(row => Number(row.position))) + 1;
      for (const photo of snapshot.ideaPhoto.filter(row => row.ideaId === pair.sourceId)) {
        if (seen.has(identity(photo))) await IdeaPhotoRepository.removeSeedRows([String(photo.id)], conn);
        else { await IdeaPhotoRepository.moveSeedPhoto(String(photo.id), pair.targetId, position++, conn); seen.add(identity(photo)); }
      }
      for (const payment of snapshot.payment.filter(row => row.targetType === 'idea' && row.targetId === pair.sourceId)) await PaymentRepository.moveSeedTarget(Number(payment.id), pair.targetId, conn);
      await IdeaRepository.recountLikes(pair.targetId, likes.size, conn);
      await DemoSeedRepository.removeRecord('idea', pair.sourceId, conn);
      await IdeaRepository.removeSeedRows([pair.sourceId], conn);
    }
  }
}
