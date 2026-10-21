// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { MeetDto } from '../../entities/meet.ts';
const state = vi.hoisted(() => ({ mobile: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => state.mobile }));
vi.mock('./MeetGroupGrids.tsx', () => ({ default: ({ title, meets }: { title: string; meets: MeetDto[] }) => <section>{title}{meets.map(meet => <span key={meet.id}>{meet.id}:{meet.status}</span>)}</section> }));
vi.mock('./WeekCalendar/WeekCalendar.tsx', () => ({ default: ({ visibleDays }: { visibleDays: number[] }) => <output>{visibleDays.join(',')}</output> }));
import Meets from './Meets.tsx';
import { groupMeets } from './groupMeets.ts';
import { DAY_MS, moscowDay, moscowFormat, moscowWeek } from './moscow-time.ts';

afterEach(() => { vi.useRealTimers(); });
const rows = [
  { id: 121, startedAt: '2026-10-19T13:00:00Z', status: 'published' },
  { id: 120, startedAt: '2026-10-12T13:00:00Z', status: 'pending' },
] as MeetDto[];
it.each([false, true])('shows every future group and hydrates on mobile=%s; calendar navigates into next week', async mobile => {
  state.mobile = mobile;
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-11T12:00:00Z'));
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const render = () => <Meets title="Расписание" meets={rows} />;
  host.innerHTML = renderToString(render());
  const errors: unknown[] = [];
  const root = hydrateRoot(host, render(), { onRecoverableError: error => errors.push(error) });
  const click = async (label: string) => act(async () => { host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click(); });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    expect([...host.querySelectorAll('section')].map(section => section.textContent)).toEqual(['12 октября120:pending', '19 октября121:published']);
    await click('Недельный календарь'); await click('Следующая неделя');
    const next = moscowDay('2026-10-12T13:00:00Z');
    expect(host.querySelector('output')?.textContent).toBe((mobile ? [next] : Array.from({ length: 7 }, (_, i) => next + i * DAY_MS)).join(','));
    await click('Предыдущая неделя');
    expect(host.querySelector('output')?.textContent?.split(',')[0]).toBe(String(moscowWeek('2026-10-11T12:00:00Z')));
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'Сегодня')!.click(); });
    expect(host.querySelector('output')?.textContent?.split(',')[0]).toBe(String(mobile ? moscowDay(new Date()) : moscowWeek(new Date())));
  } finally { await act(async () => root.unmount()); host.remove(); }
});
it('groups a Moscow midnight crossing together and formats 16:00 regardless of process timezone', () => {
  const late = { id: 1, startedAt: '2026-10-11T21:30:00Z' } as MeetDto;
  const early = { id: 2, startedAt: '2026-10-12T01:00:00Z' } as MeetDto;
  expect([...groupMeets([early, late]).values()]).toEqual([[late, early]]);
  expect(moscowFormat('2026-10-12T13:00:00Z', { hour: '2-digit', minute: '2-digit' })).toBe('16:00');
});

it('lets a centre focus on meetings that need a venue decision', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const managed = [
    { ...rows[0], place: { id: 3 }, passport: { id: 9 }, status: 'pending', bookingState: 'requested' },
    { ...rows[1], id: 122, place: { id: 3 }, passport: { id: 9 }, status: 'published', bookingState: 'confirmed' },
  ] as MeetDto[];
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Meets title="Расписание" meets={managed} management={{ placeId: 3 }} />));
    expect(host.textContent).toContain('121:pending');
    expect(host.textContent).toContain('122:published');
    const filter = [...host.querySelectorAll('button')].find(button => button.textContent === 'Требуют внимания: 1')!;
    await act(async () => filter.click());
    expect(filter.getAttribute('aria-pressed')).toBe('true');
    expect(host.textContent).toContain('121:pending');
    expect(host.textContent).not.toContain('122:published');
  } finally { await act(async () => root.unmount()); }
});
