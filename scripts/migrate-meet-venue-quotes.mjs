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
  await connection.query("SET time_zone = '+03:00'");
  const [lock] = await connection.query("SELECT GET_LOCK('quantum:meet-venue-quotes-migration', 10) AS acquired");
  if (Number(lock[0].acquired) !== 1) throw new Error('Migration lock unavailable');
  const [columns] = await connection.query("SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND ((TABLE_NAME='meet' AND COLUMN_NAME IN ('venuePrice','venueQuoteVersion')) OR (TABLE_NAME='placeLocation' AND COLUMN_NAME='rentalEnabled'))");
  const [tables] = await connection.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('placeRental','meetVenueQuote')");
  const has = (table, column) => columns.some(row => row.TABLE_NAME === table && row.COLUMN_NAME === column);
  const table = name => tables.some(row => row.TABLE_NAME === name);
  const legacy = !has('meet', 'venuePrice') && !has('meet', 'venueQuoteVersion') && has('placeLocation', 'rentalEnabled') && table('placeRental') && !table('meetVenueQuote');
  const migrated = has('meet', 'venuePrice') && has('meet', 'venueQuoteVersion') && !has('placeLocation', 'rentalEnabled') && !table('placeRental') && table('meetVenueQuote');
  if (!legacy && !migrated) throw new Error('Partial or unexpected schema; inspect before continuing');
  const [rows] = table('placeRental') ? await connection.query('SELECT COUNT(*) AS total FROM placeRental') : [[{ total: 0 }]];
  console.log(JSON.stringify({ schema: migrated ? 'migrated' : 'legacy', independentRentalsToDelete: Number(rows[0].total), apply }));
  if (legacy && apply) {
    const sql = await readFile(new URL('../migrations/008-meet-venue-quotes.sql', import.meta.url), 'utf8');
    for (const statement of sql.split(';').map(part => part.trim()).filter(Boolean)) await connection.query(statement);
    console.log('Migration applied. Run node export-db-schema.mjs.');
  }
} finally {
  try { await connection.query("SELECT RELEASE_LOCK('quantum:meet-venue-quotes-migration')"); } finally { await connection.end(); }
}
