import 'dotenv/config';
import mysql from 'mysql2/promise';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FileService } from '../src/services/file.service.js';
import ProjectRepository from '../src/repositories/project.repository.js';
import DemoSchemaRepository from '../src/repositories/demo-schema.repository.js';

interface Cover {
  projectId: number;
  passportId: number;
  title: string;
  localPath: string;
  sha256: string;
  url: string;
  prompt: string;
}
async function publicHead(url: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try { return await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) }); }
    catch (error) { if (attempt === 3) throw new Error('S3 image check failed', { cause: error }); }
  }
}
async function main() {
  const args = process.argv.slice(2);
  if (args.some(a => a !== '--apply')) throw new Error('Usage: update-wschool-covers [--apply]');
  const apply = args.includes('--apply');
  const manifestPath = resolve('docs/image-prompts/catalog/wschool-597-project-covers-v1.json');
  const parsed: unknown = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(parsed) || parsed.length !== 9) throw new Error('Expected nine generated covers');
  const covers: Cover[] = parsed;
  const seen = new Set<number>();
  for (const c of covers) {
    if (!c || !Number.isInteger(c.projectId) || c.projectId < 161 || c.projectId > 169 || seen.has(c.projectId)
      || !Number.isInteger(c.passportId) || typeof c.title !== 'string' || typeof c.localPath !== 'string'
      || !/^\w{64}$/.test(c.sha256) || typeof c.prompt !== 'string') throw new Error('Invalid cover manifest');
    seen.add(c.projectId);
    const bytes = await readFile(resolve(c.localPath));
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      || createHash('sha256').update(bytes).digest('hex') !== c.sha256) throw new Error(`Cover file changed: ${c.projectId}`);
    const expectedUrl = `${FileService.publicUrl}project-covers/wschool-597/project-${c.projectId}-${c.sha256.slice(0, 16)}.png`;
    if (c.url !== expectedUrl || c.url.length > 255) throw new Error('Unexpected image URL');
  }
  const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectionLimit: 1, connectTimeout: 120000 });
  let conn: mysql.PoolConnection | undefined;
  let locked = false;
  try {
    console.log(JSON.stringify({ phase: 'connecting', apply }));
    conn = await pool.getConnection();
    const [lock] = await conn.query<(mysql.RowDataPacket & { acquired: number })[]>("SELECT GET_LOCK('quantum:demo-seed', 10) AS acquired");
    if (lock[0].acquired !== 1) throw new Error('Maintenance lock unavailable');
    locked = true;
    const metadata = await DemoSchemaRepository.maintenanceMetadata(conn);
    const columns = await DemoSchemaRepository.columns(conn);
    if (!metadata.tables.some(t => t.tableName === 'project' && t.engine === 'InnoDB')
      || metadata.triggers.some(t => t.tableName === 'project')
      || !columns.some(c => c.tableName === 'project' && c.columnName === 'image' && c.columnType === 'varchar(255)')) throw new Error('Unexpected project schema');
    const inspect = async () => {
      const projects = await ProjectRepository.inspectSeedRows(conn!);
      return covers.map(c => {
        const p = projects.find(p => p.id === c.projectId);
        if (!p || p.placeId !== 597 || p.passportId !== c.passportId || p.deletedAt != null || p.title !== c.title) throw new Error(`Project identity changed: ${c.projectId}`);
        if (p.image !== null && p.image !== c.url) throw new Error(`Project already has a different cover: ${c.projectId}`);
        return { ...p };
      });
    };
    await conn.beginTransaction();
    let before = await inspect();
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', projects: before.map(p => ({ id: p.id, title: p.title, previousImage: p.image })), changes: before.filter(p => p.image === null).length }, null, 2));
    await conn.rollback();
    if (!apply) return;
    for (const c of covers) {
      console.log(JSON.stringify({ phase: 'upload', projectId: c.projectId }));
      const head = await publicHead(c.url);
      if (head.status === 404) await FileService.uploadBuffer(await readFile(resolve(c.localPath)), 'cover.png', 'image/png', c.url.slice(FileService.publicUrl.length));
      else if (!head.ok) throw new Error(`S3 HEAD: HTTP ${head.status}`);
      const verify = await publicHead(c.url);
      if (!verify.ok || verify.headers.get('content-type') !== 'image/png') throw new Error(`Cover unavailable: ${c.projectId}`);
    }
    await conn.beginTransaction();
    before = await inspect();
    const directory = resolve('.cache/drive-analysis', `wschool-covers-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'backup.json'), JSON.stringify({ projects: before, covers }, null, 2));
    for (const c of covers) await ProjectRepository.update(c.projectId, { image: c.url }, conn);
    if ((await inspect()).some((p, i) => p.image !== covers[i].url)) throw new Error('Cover readback failed');
    await conn.commit();
    console.log(JSON.stringify({ phase: 'committed', backup: directory }));
    await conn.beginTransaction();
    const committed = await inspect();
    if (committed.some((p, i) => p.image !== covers[i].url)) throw new Error('Post-COMMIT verification failed; read before retry');
    await conn.rollback();
    await writeFile(resolve(directory, 'result.json'), JSON.stringify({ committed: true, projects: committed }, null, 2));
    console.log(JSON.stringify({ committed: true, verified: committed.length, backup: directory }));
  } finally {
    if (conn) {
      await conn.rollback().catch(() => undefined);
      if (locked) await conn.query("SELECT RELEASE_LOCK('quantum:demo-seed')").catch(() => undefined);
      conn.release();
    }
    await pool.end();
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error && 'code' in error ? String(error.code) : error instanceof Error ? error.message : 'Cover update failed');
  process.exitCode = 1;
});
