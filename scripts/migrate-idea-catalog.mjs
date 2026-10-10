import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

let connection;
try {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) {
    if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
  }
  connection = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), connectTimeout: 15000,
  });
  const [lock] = await connection.execute('SELECT GET_LOCK(?, 30) AS acquired', ['quantum:idea-catalog:migration']);
  if (lock[0].acquired !== 1) throw new Error('Migration lock unavailable');
  const [columns] = await connection.execute(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [process.env.DB_DATABASE, 'idea'],
  );
  const names = new Set(columns.map(column => column.COLUMN_NAME));
  const additions = ['catalogId', 'cardData', 'catalogMetadata'];
  const present = additions.filter(name => names.has(name));
  const sql = await readFile(new URL('../migrations/001-idea-catalog.sql', import.meta.url), 'utf8');
  const [alter, create] = sql.split(';').map(statement => statement.trim());
  if (present.length === 0) await connection.query(alter);
  else if (present.length !== additions.length) throw new Error('Partial or incompatible idea catalog schema');
  const [tables] = await connection.execute(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [process.env.DB_DATABASE, 'ideaPhoto'],
  );
  if (!tables.length) await connection.query(create);
  console.log('Idea catalog migration applied (or already present).');
} catch (error) {
  console.error(`Migration failed (${error.code || error.name}).`);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
