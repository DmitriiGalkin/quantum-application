import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ quiet: true });
let connection;
try {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) {
    if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
  }
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 3306),
    connectTimeout: 45000,
  });
  const schema = process.env.DB_DATABASE;
  const query = async (sql) => (await connection.execute(sql, [schema]))[0];
  const tables = await query('SELECT TABLE_NAME, TABLE_TYPE, ENGINE, TABLE_COLLATION, TABLE_COMMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME');
  const columns = await query('SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA, COLUMN_COMMENT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION');
  const indexes = await query('SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME, SUB_PART, INDEX_TYPE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX');
  const relations = await query('SELECT k.TABLE_NAME, k.CONSTRAINT_NAME, k.COLUMN_NAME, k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME, r.UPDATE_RULE, r.DELETE_RULE FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME AND r.TABLE_NAME = k.TABLE_NAME WHERE k.TABLE_SCHEMA = ? AND k.REFERENCED_TABLE_NAME IS NOT NULL ORDER BY k.TABLE_NAME, k.CONSTRAINT_NAME, k.ORDINAL_POSITION');
  const triggers = await query('SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING, ACTION_STATEMENT FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ? ORDER BY TRIGGER_NAME');
  const routines = await query('SELECT ROUTINE_NAME, ROUTINE_TYPE, DATA_TYPE, ROUTINE_DEFINITION FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? ORDER BY ROUTINE_NAME');
  const events = await query('SELECT EVENT_NAME, EVENT_TYPE, STATUS, EVENT_DEFINITION FROM information_schema.EVENTS WHERE EVENT_SCHEMA = ? ORDER BY EVENT_NAME');
  const escape = (value) => String(value ?? 'NULL').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
  const grid = (headers, rows) => [headers, headers.map(() => '---'), ...rows].map(row => '| ' + row.map(escape).join(' | ') + ' |').join('\n');
  const quote = (value) => '`' + value.replace(/`/g, '``') + '`';
  const out = ['# Структура базы данных MySQL', '', `Дата выгрузки: ${new Date().toISOString()}`, '', 'Выгружены только метаданные доступных объектов; строки таблиц и реквизиты подключения не включены.', '', `Таблицы и представления: ${tables.length}.`, '', '## Объекты', '', grid(['Название', 'Тип', 'Движок', 'Сопоставление', 'Комментарий'], tables.map(t => [t.TABLE_NAME, t.TABLE_TYPE, t.ENGINE, t.TABLE_COLLATION, t.TABLE_COMMENT]))];
  for (const table of tables) {
    const name = table.TABLE_NAME;
    out.push('', `## ${name}`, '', '### Столбцы', '', grid(['Столбец', 'Тип', 'NULL', 'По умолчанию', 'Ключ', 'Дополнительно', 'Комментарий'], columns.filter(c => c.TABLE_NAME === name).map(c => [c.COLUMN_NAME, c.COLUMN_TYPE, c.IS_NULLABLE, c.COLUMN_DEFAULT, c.COLUMN_KEY, c.EXTRA, c.COLUMN_COMMENT])));
    const ix = indexes.filter(i => i.TABLE_NAME === name);
    if (ix.length) out.push('', '### Индексы', '', grid(['Название', 'Уникальный', 'Позиция', 'Столбец', 'Длина префикса', 'Тип'], ix.map(i => [i.INDEX_NAME, i.NON_UNIQUE ? 'Нет' : 'Да', i.SEQ_IN_INDEX, i.COLUMN_NAME, i.SUB_PART, i.INDEX_TYPE])));
    const fk = relations.filter(r => r.TABLE_NAME === name);
    if (fk.length) out.push('', '### Внешние ключи', '', grid(['Название', 'Столбец', 'Таблица', 'Столбец назначения', 'ON UPDATE', 'ON DELETE'], fk.map(r => [r.CONSTRAINT_NAME, r.COLUMN_NAME, r.REFERENCED_TABLE_NAME, r.REFERENCED_COLUMN_NAME, r.UPDATE_RULE, r.DELETE_RULE])));
    const [ddl] = await connection.query(`SHOW CREATE ${table.TABLE_TYPE === 'VIEW' ? 'VIEW' : 'TABLE'} ${quote(schema)}.${quote(name)}`);
    const definition = Object.entries(ddl[0]).find(([key]) => key.startsWith('Create '))?.[1];
    out.push('', '### DDL', '', '```sql', String(definition).replace(/DEFINER\s*=\s*`[^`]*`@`[^`]*`/gi, 'DEFINER=CURRENT_USER'), '```');
  }
  for (const [heading, objects, nameKey, definitionKey] of [
    ['Триггеры', triggers, 'TRIGGER_NAME', 'ACTION_STATEMENT'],
    ['Процедуры и функции', routines, 'ROUTINE_NAME', 'ROUTINE_DEFINITION'],
    ['События', events, 'EVENT_NAME', 'EVENT_DEFINITION'],
  ]) {
    out.push('', `## ${heading}`, '');
    if (!objects.length) out.push('Нет доступных объектов.');
    for (const obj of objects) out.push(`### ${obj[nameKey]}`, '', grid(['Свойство', 'Значение'], Object.entries(obj).filter(([k]) => k !== definitionKey)), '', '```sql', obj[definitionKey] ?? '-- Определение недоступно с текущими правами', '```', '');
  }
  await fs.writeFile('database-schema.md', out.join('\n') + '\n', 'utf8');
  console.log(`Saved database-schema.md: ${tables.length} tables/views, ${columns.length} columns, ${relations.length} foreign-key columns.`);
} catch (error) {
  console.error(`Schema export failed (${error.code || error.name}).`);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
