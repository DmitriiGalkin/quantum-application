import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { DemoSeedService } from '../src/services/demo-seed.service.js';
import DemoSchemaRepository from '../src/repositories/demo-schema.repository.js';
import { buildDemoMeetings, demoIdeas, demoPlaces, demoTeachers } from '../src/services/demo-seed.data.js';
import { prepareDemoImages, verifyDemoImages } from '../src/services/demo-seed-assets.service.js';
import { DemoExtensionService } from '../src/services/demo-extension.service.js';
import { extensionPrefix, extensionIdeas } from '../src/services/demo-extension.data.js';

const args = process.argv.slice(2);
const mode = args.includes('--remove') ? 'remove' : args.includes('--verify') ? 'verify' : 'seed';
const apply = args.includes('--apply');
const allowed = new Set(['--apply', '--remove', '--verify']);
if (args.some(arg => !allowed.has(arg)) || args.includes('--remove') && args.includes('--verify') || mode === 'verify' && apply) throw new Error('Usage: seed-demo.ts [--apply | --verify | --remove [--apply]]');
for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) if (process.env[key] === undefined) throw new Error(`Missing ${key}`);

const folder = fileURLToPath(new URL('../assets/demo-workshops/', import.meta.url));
const knownTables = new Set(['passport', 'user', 'place', 'placePassport', 'placeSchedule', 'idea', 'project', 'meet', 'projectUser', 'meetUser', 'payment', 'conversation', 'conversationPassport', 'message2', 'ideaPhoto', 'ideaUser', 'teacherUser', 'placeLocation']);
let pool: mysql.Pool | undefined;
let connection: mysql.PoolConnection | undefined;
let locked = false;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), connectTimeout: 10000, connectionLimit: 1, timezone: '+03:00',
  });
  connection = await pool.getConnection();
  const conn = connection;
  const [lock] = await conn.query<(mysql.RowDataPacket & { acquired: number })[]>('SELECT GET_LOCK(?, 10) AS acquired', ['quantum:demo-seed']);
  if (lock[0].acquired !== 1) throw new Error('Demo seed lock unavailable');
  locked = true;
  const columns = await DemoSchemaRepository.columns(conn);
  if (!columns.some(column => column.tableName === 'demoSeedRecord')) throw new Error('Run npm run db:migrate:demo first');
  for (const column of columns) {
    if (['passportId', 'senderPassportId', 'teacherId', 'userId', 'placeId', 'projectId', 'ideaId', 'meetId', 'targetId'].includes(column.columnName) && !knownTables.has(column.tableName)) throw new Error(`Unreviewed reference table: ${column.tableName}`);
  }
  await conn.query("SET time_zone = '+03:00'");
  await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
  await conn.beginTransaction();
  const inspected = await DemoSeedService.inspect(conn);
  const report = DemoSeedService.report(inspected.records);
  console.log(JSON.stringify({ mode, apply, current: report.counts, planned: { ideas: demoIdeas.length, projects: 18, teachers: demoTeachers.length, centres: demoPlaces.length, parents: 12, students: 24, meetings: buildDemoMeetings().length }, conflicts: inspected.conflicts }, null, 2));
  await conn.rollback();
  if (mode === 'seed' && apply) {
    if (inspected.conflicts.length) throw new Error('External references prevent updating the demo set');
    const images = await prepareDemoImages(folder);
    await verifyDemoImages(images);
    await writeFile(`${folder}/images.json`, JSON.stringify(images, null, 2) + '\n');
    const result = await DemoSeedService.seed(conn, images);
    console.log(JSON.stringify(result, null, 2));
  } else if (mode === 'remove' && apply) {
    const removed = await DemoSeedService.removeData(conn);
    console.log(JSON.stringify({ removed: removed.counts }, null, 2));
  } else if (mode === 'verify') {
    const images = JSON.parse(await readFile(`${folder}/images.json`, 'utf8')) as Record<string, string>;
    await verifyDemoImages(images);
    const baseRecords = inspected.records.filter(row => !row.entityKey.startsWith(extensionPrefix));
    const extensionRecords = inspected.records.filter(row => row.entityKey.startsWith(extensionPrefix));
    const counts = DemoSeedService.report(baseRecords).counts;
    for (const [type, count] of Object.entries({ passport: 22, user: 24, place: 4, placeSchedule: 28, placePassport: 13, idea: 12, project: 18, meet: 40, projectUser: 105, meetUser: 140 })) {
      if (counts[type as keyof typeof counts] !== count) throw new Error(`Unexpected demo count: ${type}`);
    }
    if (extensionRecords.length) {
      DemoExtensionService.verify(extensionRecords, inspected.tables);
      const extensionImages = JSON.parse(await readFile(`${folder}/extension/images.json`, 'utf8')) as Record<string, string>;
      await verifyDemoImages(extensionImages, extensionIdeas.map(row => row.key));
    }
    const meetings = inspected.tables.meet.filter(row => baseRecords.some(record => record.entityType === 'meet' && record.recordId === row.id));
    if (meetings.some(row => row.status !== 'published' || row.deletedAt !== null || new Date(String(row.startedAt)).getTime() <= Date.now())) throw new Error('Demo meetings must be published and in the future; refresh the seed');
    console.log(JSON.stringify({ verified: report }, null, 2));
  } else console.log('Preview only. Add --apply to write the demo set.');
} catch (error: unknown) {
  if (connection) await connection.rollback().catch(() => undefined);
  const message = error instanceof Error && 'code' in error ? String(error.code) : error instanceof Error ? error.message : 'Unknown error';
  console.error(`Demo operation failed: ${message}`);
  process.exitCode = 1;
} finally {
  if (connection) {
    if (locked) await connection.query('SELECT RELEASE_LOCK(?)', ['quantum:demo-seed']).catch(() => undefined);
    connection.release();
  }
  if (pool) await pool.end();
}
