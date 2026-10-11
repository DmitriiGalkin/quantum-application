import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { createConnection } from 'node:net';

const apply = process.argv.includes('--apply');
let connection;
let committed = false;
try {
  const catalog = JSON.parse(await readFile(new URL('../toy-catalog.json', import.meta.url), 'utf8'));
  const item = catalog.items.find(item => item.id === 'toy-001');
  if (!item?.description?.includes('Предлагаемый способ изготовления по фотографиям')) throw new Error('Instruction missing from catalog');
  connection = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 3306), connectTimeout: 120000,
    stream: () => createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306) }) });
  await connection.beginTransaction();
  // Check actual schema before touching the live row; no migrations are needed.
  const [columns] = await connection.execute('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [process.env.DB_DATABASE, 'idea']);
  if (!['id', 'catalogId', 'description', 'cardData'].every(name => columns.some(column => column.COLUMN_NAME === name))) throw new Error('Unexpected idea schema');
  const [ideas] = await connection.execute('SELECT * FROM idea WHERE id = ? FOR UPDATE', [54]);
  const before = ideas[0];
  if (!before || before.catalogId !== 'toy-001') throw new Error('Idea 54 is not toy-001');
  const [photos] = await connection.execute('SELECT * FROM ideaPhoto WHERE ideaId = ? ORDER BY position, id FOR UPDATE', [54]);
  if (photos.length !== 8) throw new Error('Expected eight robot photos; inspect before updating');
  const card = typeof before.cardData === 'string' ? JSON.parse(before.cardData) : before.cardData;
  const nextCard = card === null ? null : { ...card, description: item.description };
  if (before.description === item.description && isDeepStrictEqual(card, nextCard)) {
    await connection.rollback();
    console.log('Idea 54 already has the instruction; eight photos retained.');
  } else if (!apply) {
    await connection.rollback();
    console.log('Preview: update description and cardData.description for idea 54; retain eight photos and all other fields. Use --apply.');
  } else {
    const scope = createHash('sha256').update(process.env.DB_DATABASE || '').digest('hex').slice(0, 12);
    const folder = `.cache/demo/cleanup/${scope}/robot-54-${new Date().toISOString().replaceAll(':', '-')}`;
    await mkdir(folder, { recursive: true });
    await writeFile(`${folder}/backup.json`, JSON.stringify({ idea: before, photos }, null, 2), { flag: 'wx' });
    await connection.execute('UPDATE idea SET description = ?, cardData = ? WHERE id = ? AND catalogId = ?',
      [item.description, nextCard === null ? null : JSON.stringify(nextCard), 54, 'toy-001']);
    const [updated] = await connection.execute('SELECT * FROM idea WHERE id = ?', [54]);
    const [remaining] = await connection.execute('SELECT * FROM ideaPhoto WHERE ideaId = ? ORDER BY position, id', [54]);
    const expected = { ...before, description: item.description, cardData: nextCard };
    const normalized = { ...updated[0], cardData: typeof updated[0].cardData === 'string' ? JSON.parse(updated[0].cardData) : updated[0].cardData };
    if (!isDeepStrictEqual(normalized, expected) || !isDeepStrictEqual(photos, remaining)) throw new Error('Unexpected changes; rolling back');
    await connection.commit();
    committed = true;
    const [verified] = await connection.execute('SELECT description FROM idea WHERE id = ? AND catalogId = ?', [54, 'toy-001']);
    if (verified[0]?.description !== item.description) throw new Error('Post-commit verification failed');
    console.log(`Idea 54 updated and verified; eight photos unchanged. Backup: ${folder}/backup.json`);
  }
} catch (error) {
  if (connection && !committed) await connection.rollback().catch(() => {});
  console.error(committed ? 'Write committed; verify current state before retrying.' : 'Operation failed; inspect current state before retrying.');
  console.error(error && 'code' in Object(error) ? `Database error: ${error.code}` : error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
