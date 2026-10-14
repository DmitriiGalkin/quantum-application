import 'dotenv/config';
import mysql, { type Connection, type RowDataPacket } from 'mysql2/promise';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FileService } from '../src/services/file.service.js';
import { withinPlaceHours } from '../src/shared/lib/meet-time.js';
import type { PlaceScheduleDayDto, RentalStatus } from '../src/entities/index.js';
import { reportCliError } from './demo-cli.js';

const folder = '.cache/center-updates';
const marker = 'center-597-2026-10-v1';
interface RoomRow extends RowDataPacket {
  id: number; placeId: number; capacity: number | null; hourlyRate: number | null; rentalEnabled: number;
}
interface RentalPlan {
  locationId: number; passportId: number; startedAt: string; endedAt: string; status: RentalStatus;
  comment: string; rejectionReason: string | null; hourlyRate: number | null;
}
interface Covers { '575': string; '597': string }

async function verifyCover(url: string) {
  if (!FileService.isStorageUrl(url)) throw new Error('Cover must use public S3 storage');
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Cover unavailable');
}

async function uploadCovers() {
  await mkdir(folder, { recursive: true });
  const covers: Partial<Covers> = {};
  for (const id of ['575', '597'] as const) {
    const bytes = await readFile(`${folder}/place-${id}.png`);
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('Expected PNG cover');
    const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const key = `centers/${id}/illustrated-cover-${digest}.png`;
    const url = FileService.publicUrl + key;
    const existing = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    if (existing.status === 404) await FileService.uploadBuffer(bytes, `place-${id}.png`, 'image/png', key);
    else if (!existing.ok) throw new Error('Cannot inspect existing cover');
    await verifyCover(url);
    covers[id] = url;
  }
  await writeFile(`${folder}/covers.json`, JSON.stringify(covers, null, 2) + '\n');
  console.log(JSON.stringify({ covers }));
}

async function snapshot(conn: Connection) {
  const result: Record<string, RowDataPacket[]> = {};
  for (const [name, sql, params] of [
    ['places', 'SELECT * FROM place WHERE id IN (?, ?) ORDER BY id', [575, 597]],
    ['rooms', 'SELECT * FROM placeLocation WHERE placeId = ? ORDER BY id', [597]],
    ['rentals', 'SELECT * FROM placeRental WHERE placeId = ? ORDER BY id', [597]],
    ['projects', 'SELECT * FROM project WHERE id IN (?, ?) ORDER BY id', [121, 122]],
    ['meets', 'SELECT * FROM meet WHERE projectId IN (?, ?) ORDER BY id', [121, 122]],
    ['idea', 'SELECT * FROM idea WHERE id = ?', [49]],
  ] as const) {
    const [rows] = await conn.execute<RowDataPacket[]>(sql, [...params]);
    result[name] = rows;
  }
  return result;
}

async function freeSlot(conn: Connection, room: RoomRow, schedule: PlaceScheduleDayDto[], reserved: RentalPlan[]) {
  const tomorrow = new Date(Date.now() + 3 * 3600000 + 86400000).toISOString().slice(0, 10);
  for (let day = 0; day < 90; day++) {
    const date = new Date(Date.parse(`${tomorrow}T12:00:00Z`) + day * 86400000).toISOString().slice(0, 10);
    for (let hour = 10; hour <= 16; hour++) {
      const startedAt = `${date}T${hour}:00:00+03:00`;
      const endedAt = `${date}T${hour + 1}:00:00+03:00`;
      if (!withinPlaceHours(startedAt, 60, schedule)) continue;
      if (reserved.some(row => row.locationId === room.id && row.startedAt < endedAt && row.endedAt > startedAt)) continue;
      const [meets] = await conn.execute<RowDataPacket[]>(
        "SELECT id FROM meet WHERE locationId = ? AND deletedAt IS NULL AND status IN ('pending','published') AND startedAt < ? AND DATE_ADD(startedAt, INTERVAL COALESCE(duration,60) MINUTE) > ? LIMIT 1",
        [room.id, new Date(endedAt), new Date(startedAt)]);
      const [rentals] = await conn.execute<RowDataPacket[]>(
        "SELECT id FROM placeRental WHERE locationId = ? AND status IN ('pending','confirmed') AND startedAt < ? AND endedAt > ? LIMIT 1",
        [room.id, new Date(endedAt), new Date(startedAt)]);
      if (!meets.length && !rentals.length) return { startedAt, endedAt };
    }
  }
  throw new Error('No free room slot within 90 days');
}

async function updateContent(apply: boolean) {
  const covers = JSON.parse(await readFile(`${folder}/covers.json`, 'utf8')) as Covers;
  for (const id of ['575', '597'] as const) {
    if (typeof covers[id] !== 'string') throw new Error(`Missing cover ${id}`);
    await verifyCover(covers[id]);
  }
  const description = (await readFile('docs/idea-49-description.md', 'utf8')).trim();
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306),
    timezone: '+03:00', connectTimeout: 15000 });
  let locked = false;
  try {
    await conn.query("SET time_zone = '+03:00'");
    const [lock] = await conn.execute<RowDataPacket[]>('SELECT GET_LOCK(?, 10) AS acquired', ['quantum:demo-seed']);
    if (lock[0]?.acquired !== 1) throw new Error('Maintenance lock unavailable');
    locked = true;
    const requiredColumns: Record<string, string[]> = {
      place: ['id', 'image'], placeLocation: ['id', 'placeId', 'capacity', 'hourlyRate', 'rentalEnabled', 'deletedAt'],
      placeRental: ['id', 'placeId', 'locationId', 'passportId', 'startedAt', 'endedAt', 'participants', 'comment', 'status', 'rejectionReason', 'hourlyRate', 'estimatedTotal'],
      project: ['id', 'passportId', 'deletedAt'], meet: ['projectId', 'locationId', 'startedAt', 'duration', 'status', 'deletedAt'],
      idea: ['id', 'description'], passport: ['id', 'provider'], placeSchedule: ['placeId', 'weekday', 'enabled', 'startTime', 'endTime'],
    };
    for (const [table, columns] of Object.entries(requiredColumns)) {
      const [actual] = await conn.query<RowDataPacket[]>(`SHOW COLUMNS FROM ${table}`);
      if (columns.some(column => !actual.some(row => row.Field === column))) throw new Error(`Unexpected schema: ${table}`);
    }
    await conn.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    await conn.beginTransaction();
    const before = await snapshot(conn);
    if (before.places.length !== 2 || before.projects.length !== 2 || before.idea.length !== 1) throw new Error('Expected target rows missing');
    const [rooms] = await conn.execute<RoomRow[]>('SELECT * FROM placeLocation WHERE placeId = ? AND deletedAt IS NULL ORDER BY id FOR UPDATE', [597]);
    if (![5, 6, 7].every(id => rooms.some(room => room.id === id))) throw new Error('Expected rooms missing');
    if (rooms.some(room => room.capacity !== null && room.capacity < 5)) throw new Error('Room capacity too small');
    const [scheduleRows] = await conn.execute<(RowDataPacket & PlaceScheduleDayDto)[]>('SELECT weekday, enabled, startTime, endTime FROM placeSchedule WHERE placeId = ?', [597]);
    const schedule = scheduleRows.map(row => ({ ...row, enabled: Boolean(row.enabled) }));
    const plans: RentalPlan[] = [];
    const statuses: RentalStatus[] = ['pending', 'pending', 'pending', 'pending', 'confirmed', 'rejected'];
    for (let index = 0; index < 6; index++) {
      const comment = `Демонстрационная заявка [${marker}:${index + 1}]: занятие по творческому проекту, 5 участников.`;
      const existing = before.rentals.filter(row => row.comment === comment);
      if (existing.length > 1) throw new Error('Duplicate maintenance marker');
      if (existing.length === 1) continue;
      const passportId = 44 + index;
      const [applicants] = await conn.execute<RowDataPacket[]>('SELECT id FROM passport WHERE id = ? AND provider = ? FOR UPDATE', [passportId, 'quantum-demo']);
      const [projects] = await conn.execute<RowDataPacket[]>('SELECT id FROM project WHERE passportId = ? AND deletedAt IS NULL LIMIT 1', [passportId]);
      if (!applicants.length || !projects.length) throw new Error(`Demo applicant unavailable: ${passportId}`);
      const room = rooms.find(row => row.id === 5 + index % 3)!;
      plans.push({ locationId: room.id, passportId, ...await freeSlot(conn, room, schedule, plans), status: statuses[index], comment,
        rejectionReason: statuses[index] === 'rejected' ? 'Демонстрационный отказ: формат занятия требует другого оборудования.' : null,
        hourlyRate: room.hourlyRate === null ? null : Number(room.hourlyRate) });
    }
    console.log(JSON.stringify({ apply, covers, projectsToDelete: before.projects.filter(row => row.deletedAt === null).map(row => row.id), ideaId: 49, rentalAdditions: plans }));
    if (!apply) { await conn.rollback(); return; }
    const backup = `${folder}/backups/${new Date().toISOString().replaceAll(':', '-')}`;
    await mkdir(backup, { recursive: true });
    await writeFile(`${backup}/before.json`, JSON.stringify(before, null, 2) + '\n');
    for (const id of [575, 597] as const) await conn.execute('UPDATE place SET image = ? WHERE id = ?', [covers[String(id) as keyof Covers], id]);
    await conn.execute('UPDATE placeLocation SET rentalEnabled = 1 WHERE placeId = ? AND id IN (?, ?, ?) AND deletedAt IS NULL', [597, 5, 6, 7]);
    for (const plan of plans) await conn.execute(
      'INSERT INTO placeRental (placeId,locationId,passportId,startedAt,endedAt,participants,comment,status,rejectionReason,hourlyRate,estimatedTotal) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [597, plan.locationId, plan.passportId, new Date(plan.startedAt), new Date(plan.endedAt), 5, plan.comment, plan.status, plan.rejectionReason, plan.hourlyRate, plan.hourlyRate]);
    await conn.execute('UPDATE meet SET deletedAt = CURRENT_TIMESTAMP() WHERE projectId IN (?, ?) AND deletedAt IS NULL', [121, 122]);
    await conn.execute('UPDATE project SET deletedAt = CURRENT_TIMESTAMP() WHERE id IN (?, ?) AND deletedAt IS NULL', [121, 122]);
    await conn.execute('UPDATE idea SET description = ? WHERE id = ?', [description, 49]);
    const verify = async () => {
      const after = await snapshot(conn);
      if (after.places.some(row => row.image !== covers[String(row.id) as keyof Covers]) || after.projects.some(row => !row.deletedAt) || after.meets.some(row => !row.deletedAt) || after.idea[0]?.description !== description) throw new Error('Content verification failed');
      if ([5, 6, 7].some(id => !after.rooms.find(row => row.id === id)?.rentalEnabled)) throw new Error('Rental flag verification failed');
      if (after.rentals.filter(row => String(row.comment).includes(`[${marker}:`)).length !== 6) throw new Error('Rental count verification failed');
      const allowed: Record<string, string[]> = { places: ['image'], rooms: ['rentalEnabled'], projects: ['deletedAt'], meets: ['deletedAt'], idea: ['description'], rentals: [] };
      for (const [table, rows] of Object.entries(before)) {
        for (const row of rows) {
          const saved = after[table].find(candidate => candidate.id === row.id);
          if (!saved || Object.keys(row).some(key => !allowed[table].includes(key) && JSON.stringify(row[key]) !== JSON.stringify(saved[key]))) throw new Error(`Unexpected change to ${table} row ${row.id}`);
        }
      }
      for (const plan of plans) {
        const saved = after.rentals.find(row => row.comment === plan.comment);
        if (!saved || saved.status !== plan.status || saved.passportId !== plan.passportId || saved.locationId !== plan.locationId || saved.participants !== 5 || saved.rejectionReason !== plan.rejectionReason || new Date(saved.startedAt).getTime() !== Date.parse(plan.startedAt) || new Date(saved.endedAt).getTime() !== Date.parse(plan.endedAt)) throw new Error('Rental content verification failed');
      }
      return after;
    };
    await verify();
    await conn.commit();
    const after = await verify();
    await writeFile(`${backup}/after.json`, JSON.stringify(after, null, 2) + '\n');
    console.log(JSON.stringify({ committed: true, backup, rentalIds: after.rentals.filter(row => String(row.comment).includes(`[${marker}:`)).map(row => ({ id: row.id, status: row.status })) }));
  } finally {
    await conn.rollback().catch(() => undefined);
    if (locked) await conn.execute('SELECT RELEASE_LOCK(?)', ['quantum:demo-seed']).catch(() => undefined);
    await conn.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--apply', '--upload-covers'].includes(arg)) || args.length > 1) throw new Error('Usage: update-center-content.js [--upload-covers | --apply]');
  if (args.includes('--upload-covers')) await uploadCovers();
  else await updateContent(args.includes('--apply'));
}

main().catch(reportCliError);
