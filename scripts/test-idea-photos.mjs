import 'dotenv/config';
import mysql from 'mysql2/promise';
import { createConnection } from 'node:net';
import assert from 'node:assert/strict';
import { IdeaPhotoRepository } from '../dist/repositories/idea-photo.repository.js';
import { db } from '../dist/utils/dbNext.js';

let connection;
try {
  connection = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 3306), connectTimeout: 120000,
    stream: () => createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306) }) });
  // Every repository call below uses this connection. Its temporary table shadows
  // the real table and disappears on disconnect; live rows are never modified.
  await connection.query('CREATE TEMPORARY TABLE quantumIdeaPhotoTest LIKE ideaPhoto');
  await connection.query('ALTER TABLE quantumIdeaPhotoTest RENAME TO ideaPhoto');
  const photos = [
    { id: 'test-one', fileName: 'one.jpg', url: 'https://example.com/one.jpg', isCover: false, custom: { source: null } },
    { id: 'test-two', fileName: 'two.jpg', url: 'https://example.com/two.jpg', isCover: true },
  ];
  await connection.beginTransaction();
  await IdeaPhotoRepository.replace(1, photos, connection);
  await IdeaPhotoRepository.replace(2, [{ ...photos[0], id: 'other-idea-photo' }], connection);
  await connection.commit();
  assert.deepEqual(await IdeaPhotoRepository.findByIdeaId(1, connection), photos);
  const [baseline] = await connection.query('SELECT * FROM ideaPhoto ORDER BY ideaId, position, id');
  await connection.beginTransaction();
  await assert.rejects(IdeaPhotoRepository.replace(1, [
    { ...photos[0], id: 'new-photo' }, { ...photos[1], id: 'other-idea-photo' },
  ], connection), error => error.code === 'ER_DUP_ENTRY');
  await connection.rollback();
  const [after] = await connection.query('SELECT * FROM ideaPhoto ORDER BY ideaId, position, id');
  assert.deepEqual(after, baseline);
  await connection.beginTransaction();
  await IdeaPhotoRepository.replace(1, [], connection);
  await connection.commit();
  assert.deepEqual(await IdeaPhotoRepository.findByIdeaId(1, connection), []);
  assert.equal((await IdeaPhotoRepository.findByIdeaId(2, connection)).length, 1);
  console.log('Temporary-table DB checks passed: order, metadata, collision rollback, clearing and preservation of unrelated photos.');
} catch (error) {
  if (connection) await connection.rollback().catch(() => {});
  console.error(error && 'code' in Object(error) ? `Photo DB check failed: ${error.code}` : error.message);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
  await db.close();
}
