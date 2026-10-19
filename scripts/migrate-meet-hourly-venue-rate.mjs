import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

dotenv.config({ quiet: true });
const apply = process.argv.includes('--apply');
for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) {
  if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
}
const connection = await mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306),
  connectTimeout: 45000, timezone: '+03:00',
});
try {
  await connection.query("SET time_zone = '+03:00'");
  const [lock] = await connection.query("SELECT GET_LOCK('quantum:meet-hourly-venue-rate-migration', 10) AS acquired");
  if (Number(lock[0].acquired) !== 1) throw new Error('Migration lock unavailable');
  const [columns] = await connection.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='meet' AND COLUMN_NAME IN ('venuePrice','venueQuoteVersion','venueHourlyRate')");
  const names = new Set(columns.map(row => row.COLUMN_NAME));
  if (!names.has('venuePrice') || !names.has('venueQuoteVersion')) throw new Error('Migration 008 is required first');
  const [rows] = await connection.query("SELECT id,projectId,passportId,locationId,bookingState,bookingRevision,venuePrice,venueQuoteVersion FROM meet WHERE status='pending' AND deletedAt IS NULL AND bookingState IN ('requested','awaiting_teacher')" + (names.has('venueHourlyRate') ? ' AND (venueHourlyRate IS NULL OR venuePrice IS NULL)' : ''));
  console.log(JSON.stringify({ schemaReady: names.has('venueHourlyRate'), pendingToReturn: rows.length, apply }));
  if (apply) {
  if (rows.length) {
    const directory = new URL('../.cache/migrations/', import.meta.url);
    await mkdir(directory, { recursive: true });
    const backup = new URL(`meet-hourly-venue-rate-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, directory);
    await writeFile(backup, JSON.stringify(rows, null, 2));
    console.log('Backup saved in .cache/migrations');
  }
  if (!names.has('venueHourlyRate')) {
    const sql = await readFile(new URL('../migrations/009-meet-hourly-venue-rate.sql', import.meta.url), 'utf8');
    await connection.query(sql.trim());
  }
  await connection.beginTransaction();
  try {
    for (const row of rows) {
      const [result] = await connection.execute("UPDATE meet SET bookingState='needs_location',locationId=NULL,venuePrice=NULL,venueHourlyRate=NULL,bookingRevision=bookingRevision+1 WHERE id=? AND status='pending' AND bookingState IN ('requested','awaiting_teacher') AND (venueHourlyRate IS NULL OR venuePrice IS NULL)", [row.id]);
      if (!result.affectedRows) continue;
      await connection.execute("UPDATE meetVenueQuote SET status='superseded',resolvedAt=NOW() WHERE meetId=? AND status='offered'", [row.id]);
      await connection.execute('INSERT IGNORE INTO appNotification (passportId,eventKey,title,body,url) VALUES (?,?,?,?,?)', [
        row.passportId, `meet-hourly-rate-rebook-${row.id}`, 'Выберите зал для встречи заново',
        'Стоимость аренды теперь рассчитывается по почасовой ставке зала. Выберите зал и повторно отправьте заявку центру.',
        `/project/${row.projectId}#meet-${row.id}`,
      ]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
  const [remaining] = await connection.query("SELECT COUNT(*) AS total FROM meet WHERE status='pending' AND deletedAt IS NULL AND bookingState IN ('requested','awaiting_teacher') AND (venueHourlyRate IS NULL OR venuePrice IS NULL)");
  console.log(JSON.stringify({ migrated: true, pendingWithoutPrice: Number(remaining[0].total) }));
  }
} finally {
  try { await connection.query("SELECT RELEASE_LOCK('quantum:meet-hourly-venue-rate-migration')"); } finally { await connection.end(); }
}
