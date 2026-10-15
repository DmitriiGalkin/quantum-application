import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { WschoolScheduleService } from '../src/services/wschool-schedule.service.js';
import { fixWindow, validateSchedule } from '../src/services/wschool-schedule.js';

// This test never reads .env or connects to the working database.
const database = `quantum_schedule_test_${randomBytes(6).toString('hex')}`;
const pool = mysql.createPool({ host: '127.0.0.1', port: Number(process.env.DEMO_TEST_DB_PORT ?? 33079),
  user: process.env.DEMO_TEST_DB_USER ?? 'root', password: process.env.DEMO_TEST_DB_PASSWORD ?? '', connectionLimit: 1, timezone: '+03:00', connectTimeout: 5000 });
const conn = await pool.getConnection();
let created = false;
try {
  await conn.query(`CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  created = true;
  await conn.query(`USE ${database}`);
  await conn.query("SET time_zone = '+03:00'");
  const schema = await readFile('database-schema.md', 'utf8');
  const tables = [...schema.matchAll(/```sql\s+(CREATE TABLE[\s\S]*?)\s+```/g)].map(m => m[1]);
  for (const table of ['passport', 'place', 'placeLocation', 'placePassport', 'placeSchedule', 'project', 'meet', 'demoSeedRecord']) {
    const ddl = tables.find(sql => sql.startsWith(`CREATE TABLE \`${table}\``));
    if (!ddl) throw new Error(`Missing test schema: ${table}`);
    await conn.query(ddl.replaceAll('utf8mb4_0900_ai_ci', 'utf8mb4_unicode_ci'));
  }
  const originalContacts = 'x'.repeat(160);
  await conn.execute("INSERT INTO place (id,title,address,latitude,longitude,description) VALUES (597,'Живой источник','Address',55,37,?)", [`${originalContacts}\nПонедельник–пятница: 08:00–18:00 (МСК). Суббота и воскресенье: выходные.`]);
  for (const [id, title] of [[42, 'Дмитрий А.'], [70, 'Вера Владимировна Григорьева'], [71, 'Руслан Александрович Чертов'], [72, 'Посторонний преподаватель']] as const) {
    await conn.execute("INSERT INTO passport (id,provider,providerId,title,email,accessToken) VALUES (?,'test',?,?,?,?)", [id, String(id), title, 'keep@example.test', 'keep-token']);
    if (id !== 72) await conn.execute("INSERT INTO placePassport (placeId,passportId,role) VALUES (597,?,'teacher')", [id]);
  }
  await conn.execute("INSERT INTO demoSeedRecord VALUES ('quantum-wschool-real-v1','passport','grigorieva',70)");
  for (let weekday = 1; weekday <= 7; weekday++) await conn.execute('INSERT INTO placeSchedule (placeId,weekday,enabled,startTime,endTime) VALUES (597,?,?,?,?)', [weekday, weekday <= 5, '08:00:00', '18:00:00']);
  await conn.execute("INSERT INTO project (id,passportId,placeId,title,description) VALUES (160,42,597,'Деревянный робот — мастерская','Keep robot')");
  await conn.execute("INSERT INTO meet (id,projectId,passportId,placeId,startedAt,duration,status,price) VALUES (123,160,42,597,'2026-10-19 16:00:00',60,'published',0)");
  const doc = validateSchedule(JSON.parse(await readFile('wschool-schedule.json', 'utf8')));
  delete doc.import;
  fixWindow(doc, new Date('2026-10-15T10:00:00Z'));
  const portraits = [{ title: 'Галкин Дмитрий Александрович', sourceUrl: 'https://static.tildacdn.com/original.jpg', image: 'https://storage.yandexcloud.net/quantum-education/teachers/test.jpg' }];
  await conn.beginTransaction();
  const before = await WschoolScheduleService.inspect(conn);
  assert.deepEqual(WschoolScheduleService.plan(doc, before, portraits).additions, { teachers: 3, memberships: 3, projects: 9, meetings: 48 });
  await WschoolScheduleService.apply(conn, structuredClone(doc), before, portraits);
  await conn.rollback();
  assert.deepEqual(await WschoolScheduleService.inspect(conn), before);
  await conn.beginTransaction();
  const result = await WschoolScheduleService.apply(conn, doc, await WschoolScheduleService.inspect(conn), portraits);
  await conn.commit();
  const savedIds = doc.import!.meetings!.map(m => m.id);
  assert.equal(savedIds.length, 48);
  await conn.beginTransaction();
  const after = await WschoolScheduleService.inspect(conn);
  assert(String(after.place.description).startsWith(originalContacts));
  assert(String(after.place.description).length <= 255);
  assert.deepEqual(WschoolScheduleService.plan(doc, after, portraits).additions, { teachers: 0, memberships: 0, projects: 0, meetings: 0 });
  await WschoolScheduleService.apply(conn, doc, after, portraits);
  await conn.commit();
  assert.deepEqual(doc.import!.meetings!.map(m => m.id), savedIds);
  const [newMeets] = await conn.query<mysql.RowDataPacket[]>('SELECT * FROM meet WHERE id <> 123');
  assert.equal(newMeets.length, 48);
  assert(newMeets.every(m => m.price === null && m.status === 'pending' && m.locationId === null && m.maxParticipants === null));
  const [robot] = await conn.query<mysql.RowDataPacket[]>('SELECT * FROM project WHERE id=160');
  assert.equal(robot[0].description, 'Keep robot');
  const [people] = await conn.query<mysql.RowDataPacket[]>('SELECT * FROM passport');
  assert(people.filter(p => [42, 70, 71, 72].includes(p.id)).every(p => p.email === 'keep@example.test' && p.accessToken === 'keep-token'));
  assert.equal(people.find(p => p.id === 72)!.image, null);
  assert(people.filter(p => p.provider === 'quantum-directory').every(p => p.email === null && p.accessToken === null));
  await conn.beginTransaction();
  await conn.execute('UPDATE meet SET duration=30 WHERE id=?', [result.meetings[0].id]);
  assert.throws(() => WschoolScheduleService.plan(doc, { ...after, meets: after.meets.map(m => m.id === result.meetings[0].id ? { ...m, duration: 30 } : m) }, portraits), /differs/);
  await conn.rollback();
  console.log('PASS: rollback, 9 projects/48 pending meetings, repeated import, legacy registry adoption, credentials and robot preserved');
} finally {
  await conn.rollback();
  if (created) await conn.query(`DROP DATABASE ${database}`);
  conn.release();
  await pool.end();
}
