import { expect, it } from 'vitest';
import { DEFAULT_PLACE_SCHEDULE } from './default-schedule.ts';
import { withinPlaceHours } from '../../shared/lib/meet-time.ts';

it('uses the same Sunday representation as meeting availability checks', () => {
  expect(DEFAULT_PLACE_SCHEDULE.map(day => day.weekday)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  const schedule = DEFAULT_PLACE_SCHEDULE.map(day => ({ ...day, enabled: true }));
  expect(withinPlaceHours('2030-01-06T10:00:00+03:00', 60, schedule)).toBe(true);
});
