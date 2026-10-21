import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

const apply = process.argv.includes('--apply');
const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectTimeout: 45000 });
try {
  const tableNames = ['projectCampaign', 'projectCampaignVisit', 'projectCampaignBooking'];
  const inspect = async () => {
    const [rows] = await conn.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?)', [tableNames]);
    return rows.map(row => row.TABLE_NAME);
  };
  const before = await inspect();
  console.log(JSON.stringify({ apply, existing: before }));
  if (before.length && before.length !== tableNames.length) throw new Error('Partial campaign schema; inspect before applying');
  if (apply && !before.length) {
    const sql = await readFile(new URL('../migrations/011-project-campaigns.sql', import.meta.url), 'utf8');
    for (const statement of sql.split(';').map(part => part.trim()).filter(Boolean)) await conn.query(statement);
  }
  const after = await inspect();
  if (apply && after.length !== tableNames.length) throw new Error('Campaign schema verification failed');
  console.log(JSON.stringify({ schemaReady: after.length === tableNames.length, tables: after }));
} finally { await conn.end(); }
