import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

dotenv.config({ quiet: true });
const apply = process.argv.includes('--apply');
for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) {
  if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
}
const source = JSON.parse(await readFile(new URL('../wschool-schedule.json', import.meta.url), 'utf8'));
const activities = source.schedule.activities.filter(activity => activity.project && activity.sessions.length);
const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
const sameSchedule = (left, right) => Array.isArray(left) && left.length === right.length
  && left.every((slot, index) => slot.weekday === right[index].weekday
    && slot.startTime === right[index].startTime && slot.duration === right[index].duration);
const expected = activities.map(activity => ({
  id: activity.project.id,
  passportId: activity.teacher.passportId,
  weeklySchedule: activity.sessions.map(session => ({
    weekday: session.weekday, startTime: session.start, duration: minutes(session.end) - minutes(session.start),
  })),
}));
if (source.schedule.placeId !== 597 || source.schedule.timezone !== 'Europe/Moscow' || expected.length !== 7
  || expected.some(item => item.weeklySchedule.some(slot => slot.duration <= 0))) throw new Error('Неожиданное расписание источника');

const connection = await mysql.createConnection({
  host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306),
  connectTimeout: 45000, timezone: '+03:00',
});
try {
  const [rows] = await connection.query('SELECT id,passportId,placeId,kind,weeklySchedule FROM project WHERE id IN (?) AND deletedAt IS NULL', [expected.map(item => item.id)]);
  if (rows.length !== expected.length) throw new Error('Не все проекты источника найдены в БД');
  for (const item of expected) {
    const row = rows.find(row => row.id === item.id);
    const current = row.weeklySchedule === null ? [] : typeof row.weeklySchedule === 'string' ? JSON.parse(row.weeklySchedule) : row.weeklySchedule;
    if (row.placeId !== 597 || row.passportId !== item.passportId
      || (row.kind !== 'project' && row.kind !== 'regular')
      || (row.kind === 'regular' && !sameSchedule(current, item.weeklySchedule))
      || (row.kind === 'project' && row.weeklySchedule !== null)) throw new Error(`Проект ${item.id} требует отдельной проверки`);
  }
  const pending = expected.filter(item => rows.find(row => row.id === item.id).kind === 'project');
  console.log(JSON.stringify({ checked: expected.map(item => item.id), pending: pending.map(item => item.id), apply }));
  if (apply && pending.length) {
    const directory = new URL('../.cache/migrations/', import.meta.url);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL(`wschool-regular-projects-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, directory), JSON.stringify(rows, null, 2));
    await connection.beginTransaction();
    try {
      for (const item of pending) {
        const [result] = await connection.execute(
          "UPDATE project SET kind = 'regular', weeklySchedule = ? WHERE id = ? AND kind = 'project' AND weeklySchedule IS NULL",
          [JSON.stringify(item.weeklySchedule), item.id],
        );
        if (result.affectedRows !== 1) throw new Error(`Проект ${item.id} изменился во время обновления`);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    const [verified] = await connection.query('SELECT id,kind,weeklySchedule FROM project WHERE id IN (?)', [expected.map(item => item.id)]);
    if (verified.length !== expected.length || expected.some(item => {
      const row = verified.find(row => row.id === item.id);
      const schedule = typeof row?.weeklySchedule === 'string' ? JSON.parse(row.weeklySchedule) : row?.weeklySchedule;
      return row?.kind !== 'regular' || !sameSchedule(schedule, item.weeklySchedule);
    })) throw new Error('Изменение проектов не подтверждено чтением после COMMIT');
    console.log(JSON.stringify({ classified: pending.map(item => item.id) }));
  }
} finally {
  await connection.end();
}
