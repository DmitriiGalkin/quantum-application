import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';

let connection;
try {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) {
    if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
  }
  connection = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), connectTimeout: 5000,
  });
  const [lock] = await connection.execute('SELECT GET_LOCK(?, 10) AS acquired', ['quantum:payment-provider:migration']);
  if (lock[0].acquired !== 1) throw new Error('Migration lock unavailable');
  const [columns] = await connection.execute(
    "SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment' AND COLUMN_NAME = 'provider'",
  );
  const type = columns[0]?.COLUMN_TYPE;
  const oldType = "enum('yookassa','cloudpayments','tbank','stripe','paypal')";
  const newType = "enum('yookassa','cloudpayments','tbank','stripe','paypal','robokassa')";
  if (type === oldType) {
    await connection.query(await readFile(new URL('../migrations/002-robokassa-provider.sql', import.meta.url), 'utf8'));
  } else if (type !== newType) throw new Error('Unexpected provider schema; migration not applied');
  console.log('Payment provider migration applied (or already present).');
} catch (error) {
  console.error(`Payment provider migration failed (${error.code || error.name}).`);
  process.exitCode = 1;
} finally { if (connection) await connection.end(); }
