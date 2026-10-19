import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

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
  const [columns] = await connection.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project' AND COLUMN_NAME IN ('kind', 'weeklySchedule')",
  );
  const names = new Set(columns.map(column => column.COLUMN_NAME));
  if (names.size === 1) throw new Error('Частично изменённая таблица project требует ручной проверки');
  const schemaReady = names.size === 2;
  console.log(JSON.stringify({ schemaReady, apply }));
  if (apply && !schemaReady) {
    const sql = await readFile(new URL('../migrations/010-regular-project-schedule.sql', import.meta.url), 'utf8');
    await connection.query(sql.trim());
  }
  if (apply) {
    const [verified] = await connection.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project' AND COLUMN_NAME IN ('kind', 'weeklySchedule')",
    );
    if (verified.length !== 2) throw new Error('Миграция не подтверждена чтением схемы');
    console.log(JSON.stringify({ migrated: true }));
  }
} finally {
  await connection.end();
}
