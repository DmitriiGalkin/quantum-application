import 'dotenv/config';
import mysql, { type Connection, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FileService } from '../src/services/file.service.js';
import { reportCliError } from './demo-cli.js';
import type { IdeaCatalog } from '../src/entities/idea.js';
import { validateIdeaCatalog } from '../src/services/idea.validation.js';

const folder = '.cache/content-update';
interface SourcePhoto { id: string; title: string; url: string }
interface UploadedPhoto extends SourcePhoto { storageUrl: string; sha256: string; locationId?: number }
interface Assets { photos: UploadedPhoto[]; stoolCover: string }
const catalogId = 'craft-stool-carry-handle-v1';
const title = 'Деревянный табурет с ручкой для переноски';
const description = 'Изготовление деревянного табурета с фигурным отверстием в сиденье для переноски. Результат — готовый табурет с коричневой отделкой и видимой текстурой древесины. На занятиях участники изучают чертежи, размечают детали, обрабатывают и шлифуют древесину, собирают изделие и выполняют отделку под руководством преподавателя. Семь оригинальных снимков из «Фабрики игрушек» показывают изделие, его детали и чертежи. Размеры и способ сборки уточняются по чертежам с преподавателем.';

async function storage(bytes: Buffer, key: string, fileName: string): Promise<string> {
  const url = FileService.publicUrl + key;
  const existing = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
  if (existing.status === 404) await FileService.uploadBuffer(bytes, fileName, undefined, key, AbortSignal.timeout(60000));
  else if (!existing.ok) throw new Error(`Cannot inspect S3 object: ${existing.status}`);
  const check = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!check.ok || !Buffer.from(await check.arrayBuffer()).equals(bytes)) throw new Error('S3 readback differs');
  return url;
}

async function upload() {
  const sources = JSON.parse(await readFile(`${folder}/sources.json`, 'utf8')) as SourcePhoto[];
  const photos: UploadedPhoto[] = [];
  for (const source of sources) {
    console.log(`Verifying/uploading ${source.title}`);
    const bytes = await readFile(`${folder}/${source.title}`);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const stool = source.title.startsWith('IMG_20261015');
    const locationId = stool ? undefined : source.title < 'IMG_20261014_170000' ? 5 : 6;
    const key = `${stool ? `idea-catalog/${catalogId}` : `centers/597/rooms/${locationId}`}/${sha256}.jpg`;
    photos.push({ ...source, sha256, locationId, storageUrl: await storage(bytes, key, source.title) });
  }
  if (photos.filter(p => !p.locationId).length !== 7 || photos.filter(p => p.locationId === 5).length !== 6 || photos.filter(p => p.locationId === 6).length !== 8) throw new Error('Expected 7/6/8 source photos');
  const bytes = await readFile(`${folder}/stool-cover-v1.png`);
  const digest = createHash('sha256').update(bytes).digest('hex');
  const stoolCover = await storage(bytes, `idea-catalog/${catalogId}/cover-${digest}.png`, 'cover.png');
  const manifest = JSON.stringify({ photos, stoolCover }, null, 2) + '\n';
  await writeFile(`${folder}/assets.json`, manifest);
  await writeFile('docs/center-learning-content-assets.json', manifest);
  console.log(JSON.stringify({ uploaded: photos.length, stoolCover }));
}

async function snapshot(conn: Connection) {
  const tables: Record<string, RowDataPacket[]> = {};
  for (const [name, sql] of Object.entries({
    rooms: 'SELECT * FROM placeLocation WHERE placeId=597 ORDER BY id',
    photos: 'SELECT * FROM placeLocationPhoto WHERE locationId IN (SELECT id FROM placeLocation WHERE placeId=597) ORDER BY id',
    projects: 'SELECT * FROM project WHERE id IN (163,169) ORDER BY id',
    meets: 'SELECT * FROM meet ORDER BY id',
    rentals: 'SELECT * FROM placeRental WHERE placeId=597 ORDER BY id',
    ideas: "SELECT * FROM idea WHERE catalogId='craft-stool-carry-handle-v1' OR title='Деревянный табурет с ручкой для переноски'",
    ideaPhotos: "SELECT * FROM ideaPhoto WHERE ideaId IN (SELECT id FROM idea WHERE catalogId='craft-stool-carry-handle-v1') ORDER BY position,id",
    projectUsers: 'SELECT * FROM projectUser WHERE projectId IN (163,169) ORDER BY id',
    meetUsers: 'SELECT * FROM meetUser WHERE meetId IN (SELECT id FROM meet WHERE projectId IN (163,169)) ORDER BY id',
  })) tables[name] = (await conn.query<RowDataPacket[]>(sql + ' FOR UPDATE'))[0];
  return tables;
}

async function update(apply: boolean) {
  const assets = JSON.parse(await readFile('docs/center-learning-content-assets.json', 'utf8')) as Assets;
  for (const url of [assets.stoolCover, ...assets.photos.map(p => p.storageUrl)]) {
    if (!FileService.isStorageUrl(url)) throw new Error('Expected public S3 image');
  }
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectTimeout: 15000 });
  let locked = false;
  try {
    await conn.query("SET time_zone = '+03:00'");
    const [lock] = await conn.query<RowDataPacket[]>("SELECT GET_LOCK('quantum:demo-seed',10) AS acquired");
    if (lock[0].acquired !== 1) throw new Error('Maintenance lock unavailable');
    locked = true;
    await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    await conn.beginTransaction();
    // Check the live columns rather than assuming the checked-in schema is current.
    for (const table of ['placeLocation', 'placeLocationPhoto', 'project', 'meet', 'idea', 'ideaPhoto']) await conn.query(`SHOW COLUMNS FROM ${table}`);
    const before = await snapshot(conn);
    if (before.projects.length !== 2 || before.projects.some(p => p.placeId !== 597 || p.passportId !== 86 || p.deletedAt)) throw new Error('Unexpected target projects; review identities');
    const [teacher] = await conn.query<RowDataPacket[]>('SELECT title FROM passport WHERE id=?', [86]);
    if (teacher[0]?.title !== 'Вера Владимировна Григорьева') throw new Error('Unexpected teacher');
    if (before.ideas.length > 1 || before.ideas.some(i => i.catalogId !== catalogId || i.deletedAt)) throw new Error('Possible duplicate idea; review required');
    const rooms = before.rooms.filter(r => r.title === 'Спортивный зал');
    if (rooms.length > 1 || rooms.some(r => r.deletedAt)) throw new Error('Ambiguous sports room');
    const sportsId = rooms[0]?.id as number | undefined;
    const target = before.meets.filter(m => [163,169].includes(Number(m.projectId)));
    if (target.some(m => m.placeId !== 597 || m.passportId !== 86)) throw new Error('Unexpected target meeting centre/teacher');
    const active = (m: RowDataPacket) => !m.deletedAt && ['pending','published'].includes(String(m.status));
    const start = (m: RowDataPacket) => new Date(m.startedAt as string).getTime();
    const end = (m: RowDataPacket) => start(m) + Number(m.duration ?? 60) * 60000;
    const conflicts: { meetId: number; otherType: string; otherId: number; startedAt: unknown }[] = [];
    for (const meet of target.filter(active)) {
      for (const other of before.meets.filter(active)) {
        if (other.id === meet.id || !([163,169].includes(Number(other.projectId)) || (sportsId !== undefined && other.locationId === sportsId))) continue;
        if (start(meet) < end(other) && end(meet) > start(other)) conflicts.push({ meetId: Number(meet.id), otherType: 'meet', otherId: Number(other.id), startedAt: meet.startedAt });
      }
      for (const rental of before.rentals.filter(r => sportsId !== undefined && r.locationId === sportsId && ['pending','confirmed'].includes(String(r.status)))) {
        if (start(meet) < new Date(rental.endedAt as string).getTime() && end(meet) > start(rental)) conflicts.push({ meetId: Number(meet.id), otherType: 'rental', otherId: Number(rental.id), startedAt: meet.startedAt });
      }
    }
    const additions: UploadedPhoto[] = [];
    for (const photo of assets.photos.filter(p => p.locationId)) {
      const room = before.rooms.find(r => r.id === photo.locationId && !r.deletedAt);
      if (!room || !String(room.title).includes(photo.locationId === 5 ? 'мастерская' : 'актовый')) throw new Error('Room identity changed');
      const stored = before.photos.filter(p => p.locationId === photo.locationId);
      let duplicate = stored.some(p => p.url === photo.storageUrl);
      for (const old of duplicate ? [] : stored) {
        const response = await fetch(String(old.url), { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Cannot verify existing room photo');
        if (createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex') === photo.sha256) duplicate = true;
      }
      if (!duplicate && !additions.some(p => p.locationId === photo.locationId && p.sha256 === photo.sha256)) additions.push(photo);
    }
    const storedCover = before.ideaPhotos.find(p => p.id === `${catalogId}-cover-v1`);
    const coverData = storedCover ? (typeof storedCover.photoData === 'string' ? JSON.parse(storedCover.photoData) : storedCover.photoData) as Record<string, unknown> : null;
    const plan = { createIdea: !before.ideas.length, repairCoverProvenance: Boolean(coverData && coverData.origin !== 'generated'), createSportsRoom: !sportsId,
      projects: before.projects.filter(p => p.locationId !== sportsId || !sportsId).map(p => p.id),
      meets: target.filter(m => m.locationId !== sportsId || !sportsId).map(m => m.id),
      photoAdditions: additions.map(p => ({ locationId: p.locationId, sourceId: p.id })), conflicts };
    console.log(JSON.stringify({ apply, ...plan }));
    const run = `${folder}/runs/${new Date().toISOString().replace(/[:.]/g,'-')}`;
    await mkdir(run, { recursive: true });
    await writeFile(`${run}/before.json`, JSON.stringify(before, null, 2));
    await writeFile(`${run}/plan.json`, JSON.stringify(plan, null, 2));
    if (conflicts.length) throw new Error(`Sports room transfer stopped: ${conflicts.length} conflicts; ${run}/plan.json`);
    if (!apply) { await conn.rollback(); return; }
    const newUrls = [...(!before.ideas.length ? [assets.stoolCover, ...assets.photos.filter(p => !p.locationId).map(p => p.storageUrl)] : []), ...additions.map(p => p.storageUrl)];
    for (const url of newUrls) if (!(await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) })).ok) throw new Error('Missing public S3 image');
    let locationId = sportsId;
    if (!locationId) locationId = (await conn.execute<ResultSetHeader>('INSERT INTO placeLocation (placeId,title) VALUES (?,?)', [597,'Спортивный зал']))[0].insertId;
    for (const project of before.projects) if (project.locationId !== locationId) await conn.execute('UPDATE project SET locationId=? WHERE id=?', [locationId,project.id]);
    for (const meet of target) if (meet.locationId !== locationId) await conn.execute('UPDATE meet SET locationId=? WHERE id=?', [locationId,meet.id]);
    for (const photo of additions) {
      const position = Math.max(-1,...before.photos.filter(p => p.locationId === photo.locationId).map(p => Number(p.position))) + 1 + additions.filter(p => p.locationId === photo.locationId).indexOf(photo);
      await conn.execute('INSERT INTO placeLocationPhoto (locationId,url,position) VALUES (?,?,?)', [photo.locationId!,photo.storageUrl,position]);
    }
    const provenance = { origin: 'generated', generatedBy: 'imagegen',
      sourcePhotoIds: assets.photos.filter(p => !p.locationId).map(p => `${catalogId}-${p.id}`),
      promptFile: 'docs/image-prompts/catalog/stool-carry-handle-v1.md' };
    const photos = [{ id: `${catalogId}-cover-v1`, fileName: 'stool-cover-v1.png', url: assets.stoolCover, isCover: true, ...provenance },
        ...assets.photos.filter(p => !p.locationId).map(p => ({ id: `${catalogId}-${p.id}`, fileName: p.title, url: p.storageUrl, sourceUrl: p.url, driveFileId: p.id, sha256: p.sha256, isCover: false }))];
    if (!before.ideas.length) {
      const [inserted] = await conn.execute<ResultSetHeader>('INSERT INTO idea (title,description,userId,passportId,catalogId,image,catalogMetadata) VALUES (?,?,NULL,NULL,?,?,?)',
        [title,description,catalogId,assets.stoolCover,JSON.stringify({ source: 'Фабрика игрушек', sourceFolder: 'https://drive.google.com/drive/folders/1vsgEvnpL7OpXVtRZHe-3VfRCr1Mn1Upz', generation: 'imagegen; docs/image-prompts/catalog/stool-carry-handle-v1.md' })]);
      for (const [position,photo] of photos.entries()) await conn.execute('INSERT INTO ideaPhoto (id,ideaId,position,photoData) VALUES (?,?,?,?)', [photo.id,inserted.insertId,position,JSON.stringify(photo)]);
    } else {
      const cover = before.ideaPhotos.find(p => p.id === `${catalogId}-cover-v1`);
      if (!cover) throw new Error('Missing imported cover; review required');
      const data = (typeof cover.photoData === 'string' ? JSON.parse(cover.photoData) : cover.photoData) as Record<string, unknown>;
      if (data.origin !== 'generated') await conn.execute('UPDATE ideaPhoto SET photoData=? WHERE id=?', [JSON.stringify({ ...data, ...provenance }), cover.id]);
    }
    const catalog = JSON.parse(await readFile('toy-catalog.json','utf8')) as IdeaCatalog;
    const item = catalog.items.find(item => item.id === catalogId);
    if (!item) catalog.items.push({ id: catalogId, name: title, description, photos });
    else item.photos = item.photos.map(photo => photo.id === `${catalogId}-cover-v1` ? { ...photo, ...provenance } : photo);
    validateIdeaCatalog(catalog);
    await writeFile(`${run}/catalog-after.json`, JSON.stringify(catalog,null,2)+'\n');
    await conn.commit();
    const after = await snapshot(conn);
    await writeFile(`${run}/after.json`, JSON.stringify(after, null, 2));
    const stripLocation = (rows: RowDataPacket[]) => rows.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'locationId')));
    for (const table of ['projects','meets']) if (JSON.stringify(stripLocation(before[table])) !== JSON.stringify(stripLocation(after[table]))) throw new Error(`Unexpected changes in ${table} after commit; inspect backup`);
    for (const table of ['projectUsers','meetUsers','rentals']) if (JSON.stringify(before[table]) !== JSON.stringify(after[table])) throw new Error(`Unexpected changes in ${table}`);
    if (after.projects.some(p => p.locationId !== locationId) || after.meets.filter(m => [163,169].includes(Number(m.projectId))).some(m => m.locationId !== locationId)) throw new Error('Assignment verification failed');
    console.log(JSON.stringify({ committed: true, run, sportsId: locationId, ideaId: after.ideas[0]?.id, sourcePhotos: after.ideaPhotos.length - 1, roomPhotos: after.photos.length }));
    try { await writeFile('toy-catalog.json', await readFile(`${run}/catalog-after.json`)); } catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error; }
  } finally {
    await conn.rollback().catch(() => undefined);
    if (locked) await conn.query("SELECT RELEASE_LOCK('quantum:demo-seed')").catch(() => undefined);
    await conn.end();
  }
}

try {
  if (process.argv.includes('--upload')) await upload();
  else await update(process.argv.includes('--apply'));
} catch (error) { reportCliError(error); }
