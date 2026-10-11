import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { WschoolRoomsService } from '../src/services/wschool-rooms.service.js';

const database = `quantum_rooms_test_${randomBytes(6).toString('hex')}`;
const pool = mysql.createPool({ host: '127.0.0.1', port: Number(process.env.DEMO_TEST_DB_PORT ?? 33079), user: process.env.DEMO_TEST_DB_USER ?? 'root', password: process.env.DEMO_TEST_DB_PASSWORD ?? '', connectionLimit: 1 });
const conn = await pool.getConnection();
let created = false;
try {
  await conn.query(`CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); created = true;
  await conn.query(`USE ${database}`);
  const schema = await readFile('database-schema.md', 'utf8');
  for (const match of schema.matchAll(/```sql\s+(CREATE TABLE[\s\S]*?)\s+```/g)) await conn.query(match[1].replaceAll('utf8mb4_0900_ai_ci', 'utf8mb4_unicode_ci'));
  await conn.execute('INSERT INTO place (id,title,address,latitude,longitude) VALUES (597,?,?,55.84,37.24)', ['Живой источник', 'School']);
  await conn.execute("INSERT INTO placeLocation (id,title,placeId) VALUES (1,'Unrelated',575)");
  await conn.execute('INSERT INTO placeLocation (title,placeId,deletedAt) VALUES (?,597,NOW())', ['мастерская']);
  const [unrelated] = await conn.query('SELECT * FROM placeLocation WHERE placeId=575');
  await conn.beginTransaction();
  const before = await WschoolRoomsService.inspect(conn);
  await WschoolRoomsService.apply(conn, before);
  await conn.rollback();
  assert.deepEqual(await WschoolRoomsService.inspect(conn), before);
  await conn.beginTransaction();
  const added = await WschoolRoomsService.apply(conn, await WschoolRoomsService.inspect(conn));
  await conn.commit();
  await conn.beginTransaction();
  assert.deepEqual(await WschoolRoomsService.apply(conn, await WschoolRoomsService.inspect(conn)), added);
  await conn.commit();
  assert.equal(added.length, 3);
  assert.equal((await WschoolRoomsService.inspect(conn)).rooms.length, 4);
  assert.deepEqual((await conn.query('SELECT * FROM placeLocation WHERE placeId=575'))[0], unrelated);
  await conn.execute('INSERT INTO placeLocation (title,placeId) VALUES (?,597)', ['МАСТЕРСКАЯ']);
  assert.throws(() => WschoolRoomsService.plan({ ...before, rooms: [...before.rooms, { title: 'мастерская', deletedAt: null, id: 20 }, { title: 'МАСТЕРСКАЯ', deletedAt: null, id: 21 }] }), /Ambiguous/);
  console.log('Isolated MySQL: three rooms, rollback, repeat IDs, deleted room preservation and unrelated rows passed.');
} finally {
  await conn.rollback(); if (created) await conn.query(`DROP DATABASE ${database}`);
  conn.release(); await pool.end();
}
