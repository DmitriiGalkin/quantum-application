import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { DemoMaintenanceService, type CleanupManifest } from '../src/services/demo-maintenance.service.js';
import { reportCliError, withDemoConnection } from './demo-cli.js';

const args = process.argv.slice(2);
if (args.some(arg => !['--apply', '--merge'].includes(arg))) throw new Error('Usage: cleanup-demo.ts [--merge] [--apply]');
const apply = args.includes('--apply'), merge = args.includes('--merge');
try {
  await withDemoConnection(async conn => {
    const database = createHash('sha256').update([process.env.DB_HOST, process.env.DB_PORT || '3306', process.env.DB_DATABASE].join('/')).digest('hex');
    const folder = `.cache/demo/cleanup/${database}`;
    await mkdir(folder, { recursive: true });
    await conn.beginTransaction();
    const snapshot = await DemoMaintenanceService.inspect(conn);
    if (merge) {
      const pairs = DemoMaintenanceService.mergePairs(snapshot);
      console.log(JSON.stringify({ operation: 'merge', apply, pairs }, null, 2));
      if (apply && pairs.length) {
        const sourceIds = new Set(pairs.flatMap(pair => [pair.sourceId, pair.targetId]));
        const backup = {
          idea: snapshot.idea.filter(row => sourceIds.has(Number(row.id))),
          project: snapshot.project.filter(row => sourceIds.has(Number(row.ideaId))),
          ideaUser: snapshot.ideaUser.filter(row => sourceIds.has(Number(row.ideaId))),
          ideaPhoto: snapshot.ideaPhoto.filter(row => sourceIds.has(Number(row.ideaId))),
          payment: snapshot.payment.filter(row => row.targetType === 'idea' && sourceIds.has(Number(row.targetId))),
          demoSeedRecord: snapshot.demoSeedRecord.filter(row => row.entityType === 'idea' && sourceIds.has(Number(row.recordId))),
        };
        await writeFile(`${folder}/merge-${randomUUID()}.json`, JSON.stringify(backup, null, 2), { flag: 'wx' });
        await DemoMaintenanceService.merge(conn, snapshot);
      }
    } else {
      const path = `${folder}/targets.json`;
      let manifest: CleanupManifest;
      try { manifest = JSON.parse(await readFile(path, 'utf8')) as CleanupManifest; }
      catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
        manifest = DemoMaintenanceService.manifest(snapshot, database);
        await writeFile(path, JSON.stringify(manifest, null, 2), { flag: 'wx' });
      }
      if (manifest.database !== database) throw new Error('Cleanup manifest belongs to another database');
      const rows = DemoMaintenanceService.cleanupRows(snapshot, manifest);
      console.log(JSON.stringify({ operation: 'cleanup', apply, counts: DemoMaintenanceService.counts(rows), ideaIds: rows.idea.map(row => row.id), projectIds: rows.project.map(row => row.id), manifest: path }, null, 2));
      if (apply) {
        await writeFile(`${folder}/cleanup-${randomUUID()}.json`, JSON.stringify(rows, null, 2), { flag: 'wx' });
        await DemoMaintenanceService.cleanup(conn, rows);
      }
    }
    if (apply) await conn.commit();
    else await conn.rollback();
    // Fresh read confirms the outcome, including after a previous interrupted CLI run.
    await conn.beginTransaction();
    const after = await DemoMaintenanceService.inspect(conn);
    console.log(JSON.stringify({ remainingMergePairs: DemoMaintenanceService.mergePairs(after), totals: DemoMaintenanceService.counts(after) }));
    await conn.rollback();
  });
} catch (error) { reportCliError(error); }
