import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

let connection;
try {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
  connection = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), connectTimeout: 10000,
  });
  const [lock] = await connection.execute('SELECT GET_LOCK(?, 10) AS acquired', ['quantum:demo-seed']);
  if (lock[0].acquired !== 1) throw new Error('Migration lock unavailable');
  await connection.query(await readFile(new URL('../migrations/003-demo-seed.sql', import.meta.url), 'utf8'));
  const [columns] = await connection.query("SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'demoSeedRecord' ORDER BY ORDINAL_POSITION");
  const expected = [['seedKey', 'varchar(64)'], ['entityType', 'varchar(32)'], ['entityKey', 'varchar(128)'], ['recordId', 'int']];
  if (JSON.stringify(columns.map(row => [row.COLUMN_NAME, row.COLUMN_TYPE])) !== JSON.stringify(expected)) throw new Error('Unexpected registry schema');
  console.log('Demo seed registry migration ready.');
} catch (error) {
  console.error(`Demo migration failed (${error.code || error.message}).`);
  process.exitCode = 1;
} finally { if (connection) await connection.end(); }
