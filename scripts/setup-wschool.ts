import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { withDemoConnection, reportCliError } from './demo-cli.js';
import { WschoolSetupService, WSCHOOL_KEY } from '../src/services/wschool-setup.service.js';
import { validateIdeaCatalog } from '../src/services/idea.validation.js';
import { FileService } from '../src/services/file.service.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--apply')) throw new Error('Usage: setup-wschool [--apply]');
  const apply = args.includes('--apply');
  const catalog = validateIdeaCatalog(JSON.parse(await readFile(resolve('toy-catalog.json'), 'utf8')));
  const cover = catalog.items.find(item => item.id === 'toy-001')?.photos.find(photo => photo.id === 'toy-001-generated-cover-v1');
  if (!cover || !cover.isCover || cover.origin !== 'generated') throw new Error('Generated cover missing from catalog');
  if (!FileService.isStorageUrl(cover.url)) throw new Error('Cover must already be uploaded to S3');
  const response = await fetch(cover.url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`S3 cover unavailable: HTTP ${response.status}`);
  await withDemoConnection(async conn => {
    await conn.beginTransaction();
    const snapshot = await WschoolSetupService.inspect(conn);
    const plan = WschoolSetupService.plan(snapshot, cover);
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', registry: WSCHOOL_KEY, additions: plan.additions,
      centerId: plan.center?.id ?? null, projectId: plan.project?.id ?? null,
      meetings: ['2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02'].map(date => `${date} 16:00–17:00 MSK`), price: 0 }, null, 2));
    if (!apply) { await conn.rollback(); return; }
    if (Object.values(plan.additions).some(count => count > 0)) {
      const directory = resolve('.cache/demo/cleanup', `wschool-${new Date().toISOString().replace(/[:.]/g, '-')}`);
      await mkdir(directory, { recursive: true });
      const placeId = plan.center?.id;
      // Only affected rows, including the existing admin, are backed up; never print credentials.
      const backup = { ...snapshot,
        passport: snapshot.passport.filter(row => row.id === 42 || plan.teachers.some(t => t.row?.id === row.id)),
        place: snapshot.place.filter(row => row.id === placeId),
        placePassport: snapshot.placePassport.filter(row => row.placeId === placeId),
        placeSchedule: snapshot.placeSchedule.filter(row => row.placeId === placeId),
        idea: snapshot.idea.filter(row => row.id === 54), project: snapshot.project.filter(row => row.id === plan.project?.id),
        meet: snapshot.meet.filter(row => plan.meets.some(meet => meet?.id === row.id)),
      };
      await writeFile(resolve(directory, 'backup.json'), JSON.stringify(backup, null, 2));
      console.log(`Backup: ${directory}`);
    }
    const result = await WschoolSetupService.apply(conn, snapshot, cover);
    const after = await WschoolSetupService.inspect(conn);
    const verified = WschoolSetupService.plan(after, cover);
    if (Object.values(verified.additions).some(count => count !== 0)) throw new Error('Import verification failed; rolling back');
    await conn.commit();
    // Read after commit on the same connection, including registry IDs.
    await conn.beginTransaction();
    const committed = WschoolSetupService.plan(await WschoolSetupService.inspect(conn), cover);
    await conn.rollback();
    console.log(JSON.stringify({ committed: true, ...result, additionsRemaining: committed.additions }, null, 2));
  });
}

main().catch(reportCliError);
