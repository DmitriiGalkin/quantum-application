import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createConnection as createTcpConnection } from 'node:net';
import mysql from 'mysql2/promise';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const passportId = 42;
const placeId = 597;
const locationId = 8;
const publicBase = 'https://storage.yandexcloud.net/quantum-education/';
const sourceFolder = 'https://drive.google.com/drive/folders/10K_yqV_c-CPkTudVFrEzKX4vHkBIv4vu';
const sourcePhotos = [
  ['IMG_20261021_120056.jpg', '1LZQHLOKihZ7Lyt971n2S0M0QzarCmk6M'],
  ['IMG_20261021_120114.jpg', '13zlYiAWUSsgnU2ehzur5xuY7gV-iArVN'],
  ['IMG_20261021_120124.jpg', '1z_UNFoTMgtkEq4v0XMSJU7LccW_4LN9t'],
  ['IMG_20261021_120135.jpg', '1LCeB4P9WTnmD8ZVmy8xTwePPqtDxUzva'],
];
const notifications = [
  { key: 'demo-dmitry-20261021-room-photos', title: 'Новые фотографии спортивного зала', body: 'В карточку спортивного зала центра «Живой источник» добавлены четыре фотографии.', url: '/places/597', read: false },
  { key: 'demo-dmitry-20261021-center', title: 'Карточка центра обновлена', body: 'Откройте страницу центра «Живой источник» и посмотрите, как выглядит спортивный зал.', url: '/places/597', read: false },
  { key: 'demo-dmitry-20261021-profile', title: 'Профиль преподавателя', body: 'Ваш профиль преподавателя доступен для просмотра и редактирования в кабинете.', url: '/teacher/profile', read: false },
  { key: 'demo-dmitry-20261021-projects', title: 'Проекты центра', body: 'Проекты центра «Живой источник» доступны в кабинете центра.', url: '/place/projects', read: true },
  { key: 'demo-dmitry-20261021-notifications', title: 'Раздел уведомлений', body: 'Здесь сохраняются важные обновления, связанные с вашим аккаунтом.', url: '/notifications', read: true },
];

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const assets = async () => Promise.all(sourcePhotos.map(async ([fileName, driveFileId]) => {
  const bytes = await readFile(`.cache/wschool-sports-room/${fileName}`);
  if (!bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) throw new Error(`Invalid JPEG: ${fileName}`);
  const sha256 = digest(bytes);
  const key = `centers/${placeId}/rooms/${locationId}/${sha256}.jpg`;
  return { fileName, driveFileId, sourceUrl: `https://drive.google.com/file/d/${driveFileId}/view`, sha256, storageUrl: publicBase + key, key, bytes };
}));

async function connect() {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectTimeout: 120000,
    ...(process.argv.includes('--stream') ? { stream: () => createTcpConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306) }) } : {}) });
  await conn.query("SET time_zone = '+03:00'");
  return conn;
}

async function state(conn) {
  const [[passport], [room], [membership], [photos], [existing]] = await Promise.all([
    conn.execute('SELECT id,title FROM passport WHERE id=?', [passportId]),
    conn.execute('SELECT id,title,placeId,deletedAt FROM placeLocation WHERE id=?', [locationId]),
    conn.execute("SELECT placeId,passportId,role FROM placePassport WHERE placeId=? AND passportId=? AND role='admin'", [placeId, passportId]),
    conn.execute('SELECT id,url,position FROM placeLocationPhoto WHERE locationId=? ORDER BY position,id', [locationId]),
    conn.execute('SELECT id,eventKey,title,readAt,pushedAt FROM appNotification WHERE passportId=? ORDER BY id DESC LIMIT 20', [passportId]),
  ]);
  return { passport, room, membership, photos, notifications: existing };
}

async function upload(photos) {
  const client = new S3Client({ region: process.env.S3_REGION || 'ru-central1', endpoint: process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net/',
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' } });
  for (const photo of photos) {
    const head = await fetch(photo.storageUrl, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
    if (head.status === 404) await client.send(new PutObjectCommand({ Bucket: 'quantum-education', Key: photo.key, Body: photo.bytes,
      ContentType: 'image/jpeg', CacheControl: 'max-age=31536000' }));
    else if (!head.ok) throw new Error(`S3 HEAD failed: ${head.status}`);
    const response = await fetch(photo.storageUrl, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || digest(Buffer.from(await response.arrayBuffer())) !== photo.sha256) throw new Error(`S3 readback differs: ${photo.fileName}`);
    console.log(`Verified ${photo.fileName}`);
  }
  const manifest = { sourceFolder, placeId, locationId, photos: photos.map(({ fileName, driveFileId, sourceUrl, sha256, storageUrl }) =>
    ({ fileName, driveFileId, sourceUrl, sha256, storageUrl })) };
  await writeFile('docs/wschool-sports-room-photos.json', JSON.stringify(manifest, null, 2) + '\n');
}

async function apply(photos) {
  const conn = await connect();
  let transaction = false;
  try {
    await conn.beginTransaction();
    transaction = true;
    const before = await state(conn);
    if (!before.passport.some(p => p.id === passportId && String(p.title).includes('Дмитрий')) ||
      !before.room.some(r => r.id === locationId && r.placeId === placeId && r.title === 'Спортивный зал' && !r.deletedAt) ||
      !before.membership.length) throw new Error('Target identities changed');
    const additions = photos.filter(p => !before.photos.some(old => old.url === p.storageUrl));
    if (before.photos.length + additions.length > 10) throw new Error('Room photo limit exceeded');
    for (const photo of additions) {
      const response = await fetch(photo.storageUrl, { signal: AbortSignal.timeout(30000) });
      if (!response.ok || digest(Buffer.from(await response.arrayBuffer())) !== photo.sha256) throw new Error(`Missing storage object: ${photo.fileName}`);
    }
    let nextPosition = Math.max(-1, ...before.photos.map(p => Number(p.position))) + 1;
    for (const photo of additions) await conn.execute('INSERT INTO placeLocationPhoto (locationId,url,position) VALUES (?,?,?)', [locationId, photo.storageUrl, nextPosition++]);
    for (const item of notifications) await conn.execute(
      'INSERT IGNORE INTO appNotification (passportId,eventKey,title,body,url,readAt,pushedAt) VALUES (?,?,?,?,?,IF(?,NOW(),NULL),NOW())',
      [passportId, item.key, item.title, item.body, item.url, item.read ? 1 : 0]);
    await conn.commit();
    transaction = false;
    console.log(JSON.stringify({ addedPhotos: additions.length, after: await state(conn) }, null, 2));
  } catch (error) {
    if (transaction) await conn.rollback().catch(() => {});
    throw error;
  } finally { await conn.end(); }
}

const mode = process.argv[2] || '--state';
if (!['--state', '--upload', '--apply'].includes(mode)) throw new Error('Use --state, --upload, or --apply');
if (mode === '--state') {
  const conn = await connect();
  try { console.log(JSON.stringify(await state(conn), null, 2)); } finally { await conn.end(); }
} else {
  if (mode === '--upload') await upload(await assets());
  else {
    const manifest = JSON.parse(await readFile('docs/wschool-sports-room-photos.json', 'utf8'));
    if (manifest.placeId !== placeId || manifest.locationId !== locationId || manifest.photos?.length !== 4) throw new Error('Unexpected photo manifest');
    await apply(manifest.photos);
  }
}
