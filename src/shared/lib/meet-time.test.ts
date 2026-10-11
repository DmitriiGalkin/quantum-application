import { expect, it } from 'vitest';
import { meetStart, moscowInput, withinPlaceHours } from './meet-time.js';

it('round trips Moscow date/time at a UTC midnight crossing without using the browser timezone', () => {
  expect(moscowInput('2030-01-06T22:15:00Z')).toEqual({ date: '2030-01-07', time: '01:15' });
  expect(Date.parse(meetStart('2030-01-07', '01:15'))).toBe(Date.parse('2030-01-06T22:15:00Z'));
});
it('requires the whole interval, permits exact boundaries, rejects closed days and cross-midnight endings', () => {
  const schedule = [{ weekday: 1, enabled: true, startTime: '08:00', endTime: '20:00' }];
  expect(withinPlaceHours('2030-01-07T19:00:00+03:00', null, schedule)).toBe(true);
  expect(withinPlaceHours('2030-01-07T19:15:00+03:00', 60, schedule)).toBe(false);
  expect(withinPlaceHours('2030-01-07T08:00:00+03:00', 60, schedule)).toBe(true);
  expect(withinPlaceHours('2030-01-08T08:00:00+03:00', 60, schedule)).toBe(false);
  expect(withinPlaceHours('2030-01-07T08:00:00+03:00', 60, [{ ...schedule[0], enabled: false }])).toBe(false);
  expect(withinPlaceHours('2030-01-07T19:00:00+03:00', 360, schedule)).toBe(false);
});
