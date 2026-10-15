import 'dotenv/config';
import mysql from 'mysql2/promise';
import { createConnection } from 'node:net';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { WschoolScheduleService } from '../src/services/wschool-schedule.service.js';
import { fixWindow, nameMatches, teacherPortraits, validateSchedule, scheduleSeedKey } from '../src/services/wschool-schedule.js';
import { FileService } from '../src/services/file.service.js';

const file = resolve('wschool-schedule.json');
const cache = resolve('.cache/drive-analysis');
async function readPublic(url: string, method: 'GET' | 'HEAD' = 'GET'): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try { return await fetch(url, { method, signal: AbortSignal.timeout(30000) }); }
    catch (error) {
      if (attempt === 3) throw new Error(`Public image/page read failed at ${new URL(url).hostname}`, { cause: error });
    }
  }
}
async function saveJson(path: string, value: unknown) {
  await writeFile(`${path}.tmp`, JSON.stringify(value, null, 2) + '\n');
  await rename(`${path}.tmp`, path);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(a => !['--apply', '--stream'].includes(a))) throw new Error('Usage: import-wschool-schedule [--apply] [--stream]');
  const apply = args.includes('--apply');
  const doc = validateSchedule(JSON.parse(await readFile(file, 'utf8')));
  fixWindow(doc, new Date());
  await mkdir(cache, { recursive: true });
  const response = await readPublic('https://wschool.ru/');
  if (!response.ok) throw new Error(`Teacher page: HTTP ${response.status}`);
  const portraits = teacherPortraits(await response.text());
  const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectionLimit: 1, connectTimeout: 120000,
    ...(args.includes('--stream') ? { stream: () => createConnection({ host: process.env.DB_HOST!, port: Number(process.env.DB_PORT || 3306) }) } : {}),
  });
  let conn: mysql.PoolConnection | undefined;
  let locked = false;
  try {
    console.log(JSON.stringify({ phase: 'connecting', mode: apply ? 'apply' : 'preview', stream: args.includes('--stream') }));
    conn = await pool.getConnection();
    await conn.query("SET time_zone = '+03:00'");
    const [lock] = await conn.query<(mysql.RowDataPacket & { acquired: number })[]>("SELECT GET_LOCK('quantum:demo-seed', 10) AS acquired");
    if (lock[0].acquired !== 1) throw new Error('Maintenance lock unavailable');
    locked = true;
    await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    await conn.beginTransaction();
    let snapshot = await WschoolScheduleService.inspect(conn);
    const preview = WschoolScheduleService.plan(doc, snapshot, portraits);
    const report = {
      mode: apply ? 'apply' : 'preview', centerId: 597, window: doc.import,
      additions: preview.additions, skipped: preview.skipped,
      teachers: preview.teachers.map(t => ({ name: t.title, id: t.row?.id ?? null })),
      photos: preview.photoUpdates.map(p => ({ id: p.passportId, title: p.title, sourceUrl: p.sourceUrl })),
      photosUnavailable: snapshot.passport.filter(p => snapshot.members.some(m => m.passportId === p.id)
        && !preview.photoUpdates.some(photo => photo.passportId === p.id)).map(p => ({ id: p.id, title: p.title })),
    };
    console.log(JSON.stringify(report, null, 2));
    await saveJson(resolve(cache, 'wschool-preview.json'), report);
    await conn.rollback();
    if (!apply) return;
    // Persist the fixed window before the first write; a lost COMMIT response must not shift it on retry.
    await saveJson(file, doc);
    for (const p of preview.photoUpdates) {
      console.log(JSON.stringify({ phase: 'portrait', passportId: p.passportId }));
      const portrait = portraits.find(photo => photo.sourceUrl === p.sourceUrl)!;
      const imageResponse = await readPublic(p.sourceUrl);
      if (!imageResponse.ok) throw new Error(`Portrait ${p.passportId}: HTTP ${imageResponse.status}`);
      if (Number(imageResponse.headers.get('content-length') ?? 0) > 10000000) throw new Error('Portrait too large');
      const bytes = Buffer.from(await imageResponse.arrayBuffer());
      if (!bytes.length || bytes.length > 10000000) throw new Error('Invalid portrait size');
      const format = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? 'jpg'
        : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'png' : null;
      if (!format) throw new Error(`Unsupported portrait format: ${p.passportId}`);
      const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
      const key = `teachers/wschool-597/${p.passportId}-${hash}.${format}`;
      const url = FileService.publicUrl + key;
      const head = await readPublic(url, 'HEAD');
      portrait.image = head.ok ? url : await FileService.uploadBuffer(bytes, `portrait.${format}`, undefined, key);
      const verify = await readPublic(portrait.image, 'HEAD');
      if (!verify.ok || !verify.headers.get('content-type')?.startsWith('image/')) throw new Error(`S3 verification failed: ${p.passportId}`);
    }
    await conn.beginTransaction();
    snapshot = await WschoolScheduleService.inspect(conn);
    const plan = WschoolScheduleService.plan(doc, snapshot, portraits);
    // If membership or names changed during image downloads, do not apply an unreviewed photo mapping.
    if (plan.photoUpdates.some(p => !p.image)) throw new Error('Teacher directory changed during preparation');
    const teacherIds = new Set(plan.teachers.flatMap(t => t.row ? [Number(t.row.id)] : []));
    const photoIds = new Set(plan.photoUpdates.map(p => p.passportId));
    const backup = {
      passport: snapshot.passport.filter(p => teacherIds.has(p.id) || photoIds.has(p.id)),
      place: snapshot.place, members: snapshot.members, days: snapshot.days, projects: snapshot.projects,
      meets: snapshot.meets.filter(m => m.placeId === 597 || teacherIds.has(Number(m.passportId))),
      registry: snapshot.registry.filter(r => r.seedKey === scheduleSeedKey), manifest: doc,
      sourcePortraits: portraits,
    };
    const directory = resolve(cache, `wschool-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    await mkdir(directory, { recursive: true });
    await saveJson(resolve(directory, 'backup.json'), backup);
    const resultDoc = structuredClone(doc);
    const result = await WschoolScheduleService.apply(conn, resultDoc, snapshot, portraits);
    const after = await WschoolScheduleService.inspect(conn);
    const remaining = WschoolScheduleService.plan(resultDoc, after, portraits);
    if (Object.values(remaining.additions).some(n => n !== 0)
      || remaining.photoUpdates.some(p => p.previousImage !== p.image)) throw new Error('Readback verification failed');
    for (const m of result.meetings) {
      const row = after.meets.find(r => r.id === m.id);
      if (!row || row.placeId !== 597) throw new Error('Meeting readback failed');
    }
    await conn.commit();
    console.log(JSON.stringify({ phase: 'committed', backup: directory }));
    await conn.beginTransaction();
    const committed = await WschoolScheduleService.inspect(conn);
    const verified = WschoolScheduleService.plan(resultDoc, committed, portraits);
    if (Object.values(verified.additions).some(n => n !== 0)) throw new Error('Post-COMMIT verification failed; inspect before retry');
    await conn.rollback();
    resultDoc.import!.committedAt = new Date().toISOString();
    resultDoc.source.teacher_photos = 'https://wschool.ru/#teachers';
    resultDoc.analysis.photo_updates = result.photos.map(p => ({ passportId: p.passportId, image: p.image, sourceUrl: p.sourceUrl }));
    // Include all center teachers in the final directory, including those without assigned circles.
    resultDoc.import!.teachers = committed.passport.filter(p => committed.members.some(m => m.passportId === p.id)).map(p => ({ passportId: p.id, title: p.title, image: p.image, url: `/teachers/${p.id}` }));
    resultDoc.analysis.photos_unavailable = resultDoc.import!.teachers.filter(t => !result.photos.some(p => p.passportId === t.passportId)).map(t => ({ passportId: t.passportId, title: t.title }));
    resultDoc.analysis.import_summary = { projectCount: result.projects.length, meetingCount: result.meetings.length, skippedCount: result.skipped.length,
      photosMatched: result.photos.length, status: 'pending', price: null, locationId: null, maxParticipants: null };
    for (const a of resultDoc.schedule.activities) if (a.teacher) {
      const teacher = resultDoc.import!.teachers.find(t => t.passportId === a.teacher!.passportId);
      if (!teacher || !nameMatches(teacher.title === 'Дмитрий А.' ? 'Дмитрий Александрович Галкин' : teacher.title,
        a.teacher.title === 'Дмитрий А.' ? 'Дмитрий Александрович Галкин' : a.teacher.title)) throw new Error('Teacher readback mismatch');
      a.teacher = teacher;
    }
    await saveJson(file, resultDoc);
    await saveJson(resolve(cache, 'zhivoy-istochnik-schedule.json'), resultDoc);
    const finalReport = { committed: true, ...result, teachers: resultDoc.import!.teachers, window: { start: resultDoc.import!.windowStart, end: resultDoc.import!.windowEnd }, backup: directory };
    await saveJson(resolve(directory, 'result.json'), finalReport);
    await saveJson(resolve(cache, 'wschool-result.json'), finalReport);
    console.log(JSON.stringify(finalReport, null, 2));
  } finally {
    if (conn) {
      await conn.rollback().catch(() => undefined);
      if (locked) await conn.query("SELECT RELEASE_LOCK('quantum:demo-seed')").catch(() => undefined);
      conn.release();
    }
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error && 'code' in error ? String(error.code) : error instanceof Error ? error.message : 'Import failed');
  process.exitCode = 1;
});
