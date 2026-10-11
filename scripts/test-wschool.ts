import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { WschoolSetupService, schoolDates } from '../src/services/wschool-setup.service.js';
import { validateIdeaCatalog } from '../src/services/idea.validation.js';

// Only the explicitly isolated local test server. Never reads live connection settings.
const database = `quantum_wschool_test_${randomBytes(6).toString('hex')}`;
const pool = mysql.createPool({ host: '127.0.0.1', port: Number(process.env.DEMO_TEST_DB_PORT ?? 33079),
  user: process.env.DEMO_TEST_DB_USER ?? 'root', password: process.env.DEMO_TEST_DB_PASSWORD ?? '', connectionLimit: 1, timezone: '+03:00' });
const conn = await pool.getConnection();
let created = false;
try {
  await conn.query(`CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  created = true;
  await conn.query(`USE ${database}`);
  await conn.query("SET time_zone = '+03:00'");
  const schema = await readFile('database-schema.md', 'utf8');
  for (const match of schema.matchAll(/```sql\s+(CREATE TABLE[\s\S]*?)\s+```/g)) await conn.query(match[1].replaceAll('utf8mb4_0900_ai_ci', 'utf8mb4_unicode_ci'));
  const robot = validateIdeaCatalog(JSON.parse(await readFile('toy-catalog.json', 'utf8'))).items.find(row => row.id === 'toy-001')!;
  const cover = robot.photos[0];
  const originalPhotos = robot.photos.slice(1).map((photo, index) => ({ ...photo, isCover: index === 0 }));
  await conn.execute("INSERT INTO passport (id,provider,providerId,title,email,accessToken) VALUES (42,'yandex','dmitry','Дмитрий А.','kept@example.test','kept-token')");
  await conn.execute("INSERT INTO passport (id,provider,providerId,title) VALUES (41,'yandex','unrelated','Unrelated')");
  await conn.execute("INSERT INTO place (id,title,address,latitude,longitude) VALUES (575,'Existing center','Existing address',55.75,37.62)");
  await conn.execute("INSERT INTO placePassport (placeId,passportId,role) VALUES (575,42,'admin')");
  await conn.execute("INSERT INTO idea (id,title,description,catalogId,image) VALUES (54,'Robot','Keep description','toy-001',?)", [originalPhotos[0].url]);
  for (const [position, photo] of originalPhotos.entries()) await conn.execute('INSERT INTO ideaPhoto (id,ideaId,position,photoData) VALUES (?,54,?,?)', [photo.id, position, JSON.stringify(photo)]);
  await conn.beginTransaction();
  const before = await WschoolSetupService.inspect(conn);
  assert.deepEqual(WschoolSetupService.plan(before, cover).additions, { centers: 1, teachers: 10, memberships: 11, scheduleDays: 7, projects: 1, meetings: 4, photos: 1 });
  await WschoolSetupService.apply(conn, before, cover);
  await conn.rollback();
  assert.deepEqual(await WschoolSetupService.inspect(conn), before);
  await conn.beginTransaction();
  const result = await WschoolSetupService.apply(conn, await WschoolSetupService.inspect(conn), cover);
  await conn.commit();
  await conn.beginTransaction();
  const after = await WschoolSetupService.inspect(conn);
  const repeated = await WschoolSetupService.apply(conn, after, cover);
  assert.deepEqual(repeated, result);
  assert.deepEqual(await WschoolSetupService.inspect(conn), after);
  assert.equal(after.photos.length, 9);
  assert.deepEqual(after.photos.slice(1), originalPhotos.map(photo => ({ ...photo, isCover: false })));
  assert.equal(after.idea[0].description, 'Keep description');
  assert.deepEqual(after.passport.filter(row => row.id === 42 || row.id === 41), before.passport);
  assert.deepEqual(after.place.filter(row => row.id === 575), before.place);
  assert.deepEqual(after.placePassport.filter(row => row.placeId === 575), before.placePassport);
  assert.equal(after.placePassport.filter(row => row.placeId === result.placeId).length, 11);
  assert.equal(after.passport.filter(row => row.provider === 'quantum-directory' && row.email === null && row.accessToken === null && row.image === null).length, 10);
  assert.equal(after.meet.length, 4);
  for (const [i, meet] of after.meet.entries()) {
    assert.equal(meet.duration, 60); assert.equal(meet.price, 0); assert.equal(meet.status, 'published');
    assert.equal((meet.startedAt as Date).getTime(), new Date(`${schoolDates[i]}T16:00:00+03:00`).getTime());
  }
  const changed = structuredClone(after);
  changed.project.find(row => row.id === result.projectId)!.title = 'User edited';
  assert.throws(() => WschoolSetupService.plan(changed, cover), /changed/);
  const conflict = structuredClone(before);
  conflict.meet.push({ id: 99, passportId: 42, placeId: 575, startedAt: '2026-10-12 16:30:00', duration: 60, deletedAt: null, status: 'published' });
  assert.throws(() => WschoolSetupService.plan(conflict, cover), /Schedule conflict/);
  await conn.rollback();
  console.log('Isolated MySQL: rollback, repeat IDs, unchanged originals/admin/other center, directory profiles, four free meetings and conflict protection passed.');
} finally {
  await conn.rollback();
  if (created) await conn.query(`DROP DATABASE ${database}`);
  conn.release(); await pool.end();
}
