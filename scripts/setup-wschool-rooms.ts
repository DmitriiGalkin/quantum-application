import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { withDemoConnection, reportCliError } from './demo-cli.js';
import { WschoolRoomsService } from '../src/services/wschool-rooms.service.js';

async function main() {
  if (process.argv.slice(2).some(arg => arg !== '--apply')) throw new Error('Usage: setup-wschool-rooms [--apply]');
  const apply = process.argv.includes('--apply');
  await withDemoConnection(async conn => {
    await conn.beginTransaction();
    const before = await WschoolRoomsService.inspect(conn);
    const plan = WschoolRoomsService.plan(before);
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', placeId: 597, rooms: plan }, null, 2));
    if (!apply) { await conn.rollback(); return; }
    if (plan.some(room => room.id === undefined)) {
      const directory = resolve('.cache/demo/cleanup', `wschool-rooms-${new Date().toISOString().replace(/[:.]/g, '-')}`);
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, 'backup.json'), JSON.stringify(before, null, 2));
      console.log(`Backup: ${directory}`);
    }
    const result = await WschoolRoomsService.apply(conn, before);
    if (WschoolRoomsService.plan(await WschoolRoomsService.inspect(conn)).some(room => room.id === undefined)) throw new Error('Room verification failed');
    await conn.commit();
    await conn.beginTransaction();
    const committed = WschoolRoomsService.plan(await WschoolRoomsService.inspect(conn));
    await conn.rollback();
    console.log(JSON.stringify({ committed: true, rooms: committed, unchangedIds: result.every(room => committed.some(row => row.id === room.id)) }, null, 2));
  });
}
main().catch(reportCliError);
