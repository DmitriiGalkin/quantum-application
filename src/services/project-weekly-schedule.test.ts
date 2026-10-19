import { expect, it } from 'vitest';
import { validateProjectSchedule } from './project-weekly-schedule.js';

it('accepts several weekly slots and rejects invalid or duplicate times', () => {
  const schedule = [{ weekday: 1, startTime: '15:00', duration: 60 }, { weekday: 3, startTime: '16:30', duration: 90 }];
  expect(validateProjectSchedule('regular', schedule)).toEqual(schedule);
  expect(() => validateProjectSchedule('regular', [])).toThrow('Добавьте время');
  expect(() => validateProjectSchedule('regular', [{ ...schedule[0], startTime: '25:00' }])).toThrow('Проверьте день');
  expect(() => validateProjectSchedule('regular', [schedule[0], schedule[0]])).toThrow('дважды');
  expect(validateProjectSchedule('project', schedule)).toEqual([]);
});
