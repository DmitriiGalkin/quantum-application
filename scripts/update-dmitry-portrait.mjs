import 'dotenv/config';
import mysql from 'mysql2/promise';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const apply = process.argv.includes('--apply');
const portraitPath = new URL('../.cache/portrait-final/dmitry-galkin-workshop-v1.png', import.meta.url);
const bytes = await readFile(portraitPath);
const sha256 = createHash('sha256').update(bytes).digest('hex');
const key = `teachers/wschool-597/42-workshop-${sha256.slice(0, 16)}.png`;
const url = `https://storage.yandexcloud.net/quantum-education/${key}`;
const original = 'https://storage.yandexcloud.net/quantum-education/teachers/wschool-597/42-5ad72b5627d3bf60.jpg';
const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectTimeout: 45000 });
try {
  const read = async () => (await conn.query('SELECT id, title, image FROM passport WHERE id = ?', [42]))[0][0];
  const before = await read();
  if (!before || !before.title?.includes('Дмитрий') || (before.image !== original && before.image !== url)) throw new Error('Dmitry profile differs from expected state');
  console.log(JSON.stringify({ apply, profileId: before.id, title: before.title, previousImage: before.image, nextImage: url, sha256 }));
  if (apply && before.image !== url) {
  const backupDir = new URL('../.cache/portrait-final/', import.meta.url);
  await mkdir(backupDir, { recursive: true });
  await writeFile(new URL('dmitry-profile-backup.json', backupDir), JSON.stringify({ before, nextImage: url, sha256 }, null, 2));
  const s3 = new S3Client({ region: process.env.S3_REGION || 'ru-central1', endpoint: process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net/',
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' } });
  await s3.send(new PutObjectCommand({ Bucket: 'quantum-education', Key: key, Body: bytes, ContentType: 'image/png', CacheControl: 'max-age=31536000' }));
  const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
  if (!head.ok || head.headers.get('content-type') !== 'image/png') throw new Error(`Uploaded portrait unavailable: ${head.status}`);
  const [result] = await conn.execute('UPDATE passport SET image = ? WHERE id = ? AND image = ?', [url, 42, original]);
  if (result.affectedRows !== 1) throw new Error('Profile changed before update; inspect current state');
  const after = await read();
  if (after.image !== url) throw new Error('Profile readback failed');
  console.log(JSON.stringify({ committed: true, profileId: 42, image: after.image }));
  }
} finally { await conn.end(); }
