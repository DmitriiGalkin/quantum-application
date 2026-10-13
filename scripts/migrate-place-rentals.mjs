import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createConnection } from 'node:net';

dotenv.config({ quiet: true });
let connection;
try {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
  connection = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 3306), connectTimeout: 300000, timezone: '+03:00',
    ...(process.argv.includes('--stream') ? { stream: () => createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306) }) } : {}) });
  await connection.query("SET time_zone = '+03:00'");
  const [lock] = await connection.query("SELECT GET_LOCK('quantum:place-rentals-migration', 10) AS acquired");
  if (Number(lock[0].acquired) !== 1) throw new Error('Migration lock unavailable');
  for (const table of ['placeLocation', 'place', 'passport', 'meet', 'project', 'placePassport']) {
    const [rows] = await connection.query(`SHOW CREATE TABLE ${table}`);
    console.log(JSON.stringify(rows));
  }
  const [engines] = await connection.query("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('placeLocation','place','passport','meet','project','placePassport')");
  if (engines.length !== 6 || engines.some(table => table.ENGINE !== 'InnoDB')) throw new Error('Expected six InnoDB domain tables');
  const [triggers] = await connection.query("SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE() AND EVENT_OBJECT_TABLE IN ('placeLocation','placeRental','placeLocationPhoto')");
  if (triggers.length) throw new Error('Review existing room/rental triggers before migration');
  const [columns] = await connection.query('SHOW COLUMNS FROM placeLocation');
  if (!['id', 'title', 'placeId', 'deletedAt'].every(name => columns.some(column => column.Field === name))) throw new Error('Unexpected base room schema');
  const expected = ['description', 'capacity', 'hourlyRate', 'rentalEnabled'];
  const present = expected.filter(name => columns.some(column => column.Field === name));
  const [tables] = await connection.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('placeLocationPhoto', 'placeRental')");
  const ready = present.length === expected.length && tables.length === 2;
  console.log(JSON.stringify({ schemaReady: ready, apply: process.argv.includes('--apply') }));
  if (!ready && process.argv.includes('--apply')) {
    if (present.length || tables.length) throw new Error('Partial migration: inspect actual schema before continuing');
    const [before] = await connection.query('SELECT id, title, placeId, deletedAt FROM placeLocation ORDER BY id');
    const backupDirectory = `.cache/place-rentals/${new Date().toISOString().replaceAll(':', '-')}`;
    await mkdir(backupDirectory, { recursive: true });
    await writeFile(`${backupDirectory}/rooms.json`, JSON.stringify(before, null, 2));
    console.log(`Room backup: ${backupDirectory}/rooms.json`);
    const sql = await readFile(new URL('../migrations/006-place-rentals.sql', import.meta.url), 'utf8');
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await connection.query(statement);
    const [verified] = await connection.query('SHOW COLUMNS FROM placeLocation');
    if (!expected.every(name => verified.some(column => column.Field === name))) throw new Error('Schema verification failed');
    for (const table of ['placeLocationPhoto', 'placeRental']) await connection.query(`SHOW CREATE TABLE ${table}`);
    const [after] = await connection.query('SELECT id, title, placeId, deletedAt FROM placeLocation ORDER BY id');
    if (JSON.stringify(after) !== JSON.stringify(before)) throw new Error('Existing rooms changed during migration');
    const [defaults] = await connection.query('SELECT COUNT(*) AS invalid FROM placeLocation WHERE description IS NOT NULL OR capacity IS NOT NULL OR hourlyRate IS NOT NULL OR rentalEnabled <> 0');
    if (Number(defaults[0].invalid)) throw new Error('Unexpected initial room values');
    console.log('Migration applied and schema verified. Run node export-db-schema.mjs.');
  }
} catch (error) {
  console.error(`Rental migration/read failed (${error.code || error.message}). No automatic write retry.`);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
