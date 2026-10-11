import { readFile, mkdir, writeFile } from 'node:fs/promises';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';

export async function runMeetMigration(conn: PoolConnection, apply = false): Promise<void> {
  const [columns] = await conn.query<RowDataPacket[]>(
    "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meet' AND COLUMN_NAME IN ('locationId', 'maxParticipants')",
  );
  if (columns.length && (columns.length !== 2 || columns.some(c => !/^int(?:\(11\))?$/.test(c.COLUMN_TYPE) || c.IS_NULLABLE !== 'YES'))) {
    throw new Error('Unexpected meet schema; inspect before applying migration');
  }
  const [eligible] = await conn.query<RowDataPacket[]>(
    `SELECT m.id, p.locationId FROM meet m JOIN project p ON p.id = m.projectId
     JOIN placeLocation l ON l.id = p.locationId AND l.placeId = m.placeId AND l.deletedAt IS NULL`,
  );
  console.log(JSON.stringify({ schemaReady: columns.length === 2, eligibleMeetCount: eligible.length, apply: apply }));
  if (!apply) return;
  if (!columns.length) {
    const backupDir = `.cache/meet-migration/${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await mkdir(backupDir, { recursive: true });
    await writeFile(`${backupDir}/backfill.json`, JSON.stringify(eligible, null, 2));
    await conn.query(await readFile('migrations/005-meet-location-capacity.sql', 'utf8'));
  }
  // Backfill is a separate transaction because MySQL DDL commits implicitly.
  // A durable marker lets a read after interruption determine whether it completed.
  await conn.query(`CREATE TABLE IF NOT EXISTS quantumMigration (name VARCHAR(100) PRIMARY KEY, appliedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);
  await conn.beginTransaction();
  const [applied] = await conn.query<RowDataPacket[]>('SELECT name FROM quantumMigration WHERE name = ? FOR UPDATE', ['005-meet-location-capacity']);
  if (!applied.length) {
    await conn.query(`UPDATE meet m JOIN project p ON p.id = m.projectId
      JOIN placeLocation l ON l.id = p.locationId AND l.placeId = m.placeId AND l.deletedAt IS NULL
      SET m.locationId = p.locationId WHERE m.locationId IS NULL`);
    await conn.execute('INSERT INTO quantumMigration (name) VALUES (?)', ['005-meet-location-capacity']);
  }
  await conn.commit();
  const [verified] = await conn.query<RowDataPacket[]>(
    "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meet' AND COLUMN_NAME IN ('locationId', 'maxParticipants')",
  );
  const [constraints] = await conn.query<RowDataPacket[]>(
    "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'meet'",
  );
  if (verified.length !== 2 || !constraints.some(c => c.CONSTRAINT_NAME === 'fk_meet_location') || !constraints.some(c => c.CONSTRAINT_NAME === 'chk_meet_max_participants')) throw new Error('Migration verification failed');
  console.log('Meet migration committed and schema verified by reading.');
}
