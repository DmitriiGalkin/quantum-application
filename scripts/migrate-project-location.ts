import { readFile } from 'node:fs/promises';
import type { RowDataPacket } from 'mysql2/promise';
import { withDemoConnection, reportCliError } from './demo-cli.js';

await withDemoConnection(async conn => {
  const [columns] = await conn.execute<RowDataPacket[]>(
    'SELECT COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    ['project', 'locationId'],
  );
  if (!columns.length) {
    await conn.query(await readFile('migrations/004-project-location.sql', 'utf8'));
  } else if (columns[0].COLUMN_TYPE !== 'int' || columns[0].IS_NULLABLE !== 'YES') {
    throw new Error('Unexpected project.locationId schema');
  }
  const [relations] = await conn.execute<RowDataPacket[]>(
    'SELECT REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    ['project', 'locationId'],
  );
  if (!relations.some(row => row.REFERENCED_TABLE_NAME === 'placeLocation' && row.REFERENCED_COLUMN_NAME === 'id')) {
    throw new Error('Missing project.locationId foreign key');
  }
  console.log('Project location migration verified.');
}).catch(reportCliError);
