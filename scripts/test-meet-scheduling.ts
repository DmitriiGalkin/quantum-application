import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import type { Passport } from '../src/entities/passport.js';
import { runMeetMigration } from './meet-migration.js';

// This test never loads .env or connects to the working database.
const database = `quantum_meets_test_${randomBytes(6).toString('hex')}`;
const port = Number(process.env.DEMO_TEST_DB_PORT ?? 33079);
const user = process.env.DEMO_TEST_DB_USER ?? 'root';
const password = process.env.DEMO_TEST_DB_PASSWORD ?? '';
const pool = mysql.createPool({ host: '127.0.0.1', port, user, password, timezone: 'Z' });
const conn = await pool.getConnection();
let created = false;
let closeAppDb: (() => Promise<void>) | undefined;
try {
  await conn.query(`CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); created = true;
  await conn.query(`USE ${database}`);
  await conn.query("SET time_zone = '+00:00'");
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const schema = await readFile('database-schema.md', 'utf8');
  for (const match of schema.matchAll(/```sql\s+(CREATE TABLE[\s\S]*?)\s+```/g)) {
    if (/CREATE TABLE `meet`/.test(match[1])) continue;
    await conn.query(match[1].replaceAll('utf8mb4_0900_ai_ci', 'utf8mb4_unicode_ci'));
  }
  await conn.query(`CREATE TABLE meet (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, projectId INT NOT NULL, passportId INT NOT NULL,
    price INT NULL, duration INT NULL, status ENUM('pending','published','cancelled') NOT NULL DEFAULT 'pending',
    startedAt TIMESTAMP NULL DEFAULT NULL, deletedAt TIMESTAMP NULL DEFAULT NULL, placeId INT NOT NULL
  ) ENGINE=InnoDB`);
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.query("INSERT INTO passport (id,providerId,provider,accessToken,title) VALUES (10,'t1','test','t1','Teacher 1'),(20,'t2','test','t2','Teacher 2'),(30,'a','test','a','Admin'),(40,'p','test','p','Parent')");
  await conn.query("INSERT INTO place (id,title,address,latitude,longitude) VALUES (1,'School','Street',55,37),(2,'Other school','Street',55,37)");
  await conn.query("INSERT INTO placePassport (passportId,placeId,role) VALUES (30,1,'admin')");
  await conn.query("INSERT INTO placeLocation (id,placeId,title,deletedAt) VALUES (1,1,'Hall',NULL),(2,2,'Other hall',NULL),(3,1,'Deleted hall',NOW())");
  await conn.query("INSERT INTO project (id,passportId,placeId,locationId,title,description) VALUES (1,10,1,1,'Workshop',''),(2,20,1,1,'Art',''),(3,10,2,2,'Other project',''),(4,10,1,3,'Old hall',''),(5,10,1,2,'Wrong hall','')");
  await conn.query("INSERT INTO meet (id,projectId,passportId,placeId,startedAt) VALUES (1,1,10,1,'2030-01-07 06:00:00'),(2,4,10,1,'2030-01-07 07:00:00'),(3,5,10,1,'2030-01-07 08:00:00')");
  await runMeetMigration(conn, true);
  const [roomColumns] = await conn.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM placeLocation');
  if (!roomColumns.some(column => column.Field === 'rentalEnabled')) {
    const rentalMigration = await readFile('migrations/006-place-rentals.sql', 'utf8');
    for (const statement of rentalMigration.split(';').map(value => value.trim()).filter(Boolean)) await conn.query(statement);
  }
  const [backfill] = await conn.query<mysql.RowDataPacket[]>('SELECT locationId,maxParticipants FROM meet ORDER BY id');
  assert.deepEqual(backfill.map(row => [row.locationId, row.maxParticipants]), [[1, null], [null, null], [null, null]]);
  await conn.query('UPDATE meet SET deletedAt = NOW()');
  for (const placeId of [1, 2]) for (let weekday = 1; weekday <= 7; weekday++) {
    await conn.execute('INSERT INTO placeSchedule (placeId,weekday,enabled,startTime,endTime) VALUES (?,?,1,?,?)', [placeId, weekday, '08:00', '20:00']);
  }
  await conn.query("INSERT INTO user (id,passportId,title,description) VALUES (1,40,'Child 1',''),(2,40,'Child 2',''),(3,40,'Child 3','')");
  Object.assign(process.env, { DB_HOST: '127.0.0.1', DB_PORT: String(port), DB_USER: user, DB_PASSWORD: password, DB_DATABASE: database });
  const { MeetService } = await import('../src/services/meet.service.js');
  const { MeetUserService } = await import('../src/services/meet-user.service.js');
  const { db } = await import('../src/utils/dbNext.js'); closeAppDb = () => db.close();
  const teacher = { id: 10 } as Passport;
  const otherTeacher = { id: 20 } as Passport;
  const input = (projectId: number, time: string, locationId?: number | null) => ({ projectId, startedAt: `2030-01-07T${time}:00+03:00`, duration: 60, price: 0, maxParticipants: 1, ...(locationId === undefined ? {} : { locationId }) });
  for (const maxParticipants of [0, -1, 1.5]) await assert.rejects(MeetService.create(teacher, { ...input(1, '10:00'), maxParticipants }), /целым числом/);
  await assert.rejects(MeetService.create(teacher, input(1, '10:00', 2)), /активный зал/);
  const first = await MeetService.create(teacher, input(1, '10:00'));
  assert.equal((await MeetService.findById(first))?.locationId, 1);
  assert.equal((await MeetService.findById(first))?.startedAt, '2030-01-07T07:00:00.000Z');
  await assert.rejects(MeetService.create(teacher, input(3, '10:15')), error => (error as { status: number }).status === 409);
  await assert.rejects(MeetService.create(otherTeacher, input(2, '10:15')), error => (error as { status: number }).status === 409);
  const adjacent = await MeetService.create(otherTeacher, input(2, '11:00'));
  const noHall = await MeetService.create(otherTeacher, input(2, '10:00', null));
  await MeetService.updateStatus(first, 'published', 30, 1);
  const joins = await Promise.allSettled([MeetUserService.create(40, { userId: 1, meetId: first }), MeetUserService.create(40, { userId: 2, meetId: first })]);
  assert.equal(joins.filter(result => result.status === 'fulfilled').length, 1);
  const rejectedJoin = joins.find(result => result.status === 'rejected');
  assert.equal(rejectedJoin?.status === 'rejected' && rejectedJoin.reason.status, 409);
  assert.equal((await conn.query<mysql.RowDataPacket[]>('SELECT * FROM meetUser WHERE meetId = ?', [first]))[0].length, 1);
  assert.equal((await MeetService.findById(first))?.participantCount, 1);
  await assert.rejects(MeetService.update({ id: first, maxParticipants: null }, 10), /нельзя очистить/);
  await MeetService.update({ id: first, maxParticipants: 2 }, 10);
  const limitRace = await Promise.allSettled([MeetUserService.create(40, { userId: 3, meetId: first }), MeetService.update({ id: first, maxParticipants: 1 }, 10)]);
  assert.equal(limitRace.filter(result => result.status === 'fulfilled').length, 1);
  const [capacity] = await conn.query<mysql.RowDataPacket[]>('SELECT maxParticipants,(SELECT COUNT(*) FROM meetUser WHERE meetId = ?) AS enrolled FROM meet WHERE id = ?', [first, first]);
  assert.ok(capacity[0].enrolled <= capacity[0].maxParticipants);
  await MeetService.update({ id: first, startedAt: '2030-01-07T09:00:00+03:00' }, 30, 1);
  assert.equal((await MeetService.findById(first))?.status, 'published');
  await MeetService.update({ id: first, startedAt: '2030-01-07T08:00:00+03:00' }, 10);
  assert.equal((await MeetService.findById(first))?.status, 'pending');
  const moves = await Promise.allSettled([
    MeetService.update({ id: first, startedAt: '2030-01-07T14:00:00+03:00' }, 30, 1),
    MeetService.update({ id: adjacent, startedAt: '2030-01-07T14:00:00+03:00' }, 30, 1),
  ]);
  assert.equal(moves.filter(result => result.status === 'fulfilled').length, 1);
  const rejectedMove = moves.find(result => result.status === 'rejected');
  assert.equal(rejectedMove?.status === 'rejected' && rejectedMove.reason.status, 409);
  await conn.execute("UPDATE meet SET startedAt = '2030-01-07 11:00:00', status = 'cancelled' WHERE id = ?", [noHall]);
  await MeetService.update({ id: noHall, locationId: 1 }, 30, 1);
  await assert.rejects(MeetService.updateStatus(noHall, 'published', 30, 1), error => (error as { status: number }).status === 409);
  assert.equal((await MeetService.findById(noHall))?.status, 'cancelled');
  await assert.rejects(MeetService.update({ id: first, startedAt: '2030-01-07T19:30:00+03:00' }, 10), /часы работы/);
  await assert.rejects(MeetService.update({ id: first, price: 5 }, 30, 2), error => (error as { status: number }).status === 403);
  await assert.rejects(MeetService.update({ id: first, locationId: 2 }, 10), /активный зал/);
  const creations = await Promise.allSettled([MeetService.create(teacher, input(1, '15:00')), MeetService.create(otherTeacher, input(2, '15:00'))]);
  assert.equal(creations.filter(result => result.status === 'fulfilled').length, 1);
  const rejectedCreation = creations.find(result => result.status === 'rejected');
  assert.equal(rejectedCreation?.status === 'rejected' && rejectedCreation.reason.status, 409);
  await conn.query("INSERT INTO meet (id,projectId,passportId,placeId,startedAt,status) VALUES (999,1,10,1,'2030-01-08 06:00:00','published')");
  for (const userId of [1, 2, 3]) await MeetUserService.create(40, { meetId: 999, userId });
  await MeetService.update({ id: 999, price: 50 }, 10);
  assert.equal((await MeetService.findById(999))?.maxParticipants, null);
  await assert.rejects(MeetService.update({ id: 999, maxParticipants: 2 }, 10), error => (error as { status: number }).status === 409);
  assert.equal((await MeetService.findById(999))?.maxParticipants, null);
  await assert.rejects(MeetService.create(teacher, { ...input(1, '09:30', null), startedAt: '2030-01-08T09:30:00+03:00' }), error => (error as { status: number }).status === 409);
  await conn.execute('UPDATE project SET locationId = NULL WHERE id = 1');
  assert.equal((await MeetService.findById(first))?.locationId, 1);
  await conn.execute('UPDATE project SET locationId = 1 WHERE id = 5');
  await runMeetMigration(conn, true);
  const [unchanged] = await conn.query<mysql.RowDataPacket[]>('SELECT locationId FROM meet WHERE id = 3');
  assert.equal(unchanged[0].locationId, null);
  console.log('Isolated DB passed: migration/backfill, last seat and limit races, conflicting concurrent moves, cross-centre teacher conflicts, halls, adjacent intervals, approval rollback, status/access and Moscow time.');
} finally {
  await closeAppDb?.();
  await conn.rollback();
  if (created) await conn.query(`DROP DATABASE ${database}`);
  conn.release(); await pool.end();
}
