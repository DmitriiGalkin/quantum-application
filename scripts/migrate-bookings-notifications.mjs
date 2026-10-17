import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

let conn;
try {
  conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectTimeout: 15000 });
  const [lock] = await conn.query("SELECT GET_LOCK('quantum:operations-migration', 10) acquired");
  if (Number(lock[0].acquired) !== 1) throw new Error('Migration lock unavailable');
  const tables = ['meetBookingChange', 'meetChangeParticipant', 'appNotification', 'pushSubscription', 'paymentRefund'];
  const [present] = await conn.query('SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?)', [tables]);
  const [meet] = await conn.query('SHOW COLUMNS FROM meet');
  const [chat] = await conn.query('SHOW COLUMNS FROM conversationPassport');
  const columns = meet.filter(c => ['bookingState', 'bookingRevision'].includes(c.Field)).length + chat.filter(c => ['lastDeliveredMessageId', 'lastReadMessageId'].includes(c.Field)).length;
  const ready = present.length === tables.length && columns === 4;
  console.log(JSON.stringify({ ready, existingTables: present.length, existingColumns: columns, apply: process.argv.includes('--apply') }));
  if (!ready && (present.length || columns)) throw new Error('Partial migration; inspect schema before resuming DDL');
  if (!ready && process.argv.includes('--apply')) {
    const directory = `.cache/operations-migration/${new Date().toISOString().replaceAll(':','-')}`;
    await mkdir(directory, { recursive: true });
    const backup = {};
    for (const table of ['meet', 'conversationPassport']) backup[table] = (await conn.query(`SELECT * FROM ${table}`))[0];
    await writeFile(`${directory}/before.json`, JSON.stringify(backup));
    const sql = await readFile(new URL('../migrations/007-bookings-notifications.sql', import.meta.url), 'utf8');
    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await conn.query(statement);
    for (const table of tables) await conn.query(`SHOW CREATE TABLE ${table}`);
    console.log('Migration applied; refresh database-schema.md');
  }
} catch (error) {
  console.error(`Operations migration failed: ${error.code || error.message}. No automatic retry.`);
  process.exitCode = 1;
} finally { if (conn) await conn.end(); }
