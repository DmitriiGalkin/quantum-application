// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, it, vi } from 'vitest';
import type { DragEndEvent } from '@dnd-kit/core';
import type { MeetDto, PlaceDto } from 'entities';
const dnd = vi.hoisted(() => ({ onDragEnd: undefined as undefined | ((event: DragEndEvent) => Promise<void>) }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: ReactNode; onDragEnd: (event: DragEndEvent) => Promise<void> }) => { dnd.onDragEnd = onDragEnd; return children; },
  MouseSensor: {}, TouchSensor: {}, KeyboardSensor: {}, useSensor: vi.fn(), useSensors: vi.fn(),
}));
vi.mock('../../../requests.ts', () => ({ fetchPlace: vi.fn(), fetchUpdateMeet: vi.fn() }));
vi.mock('./WeekCalendarGrid.tsx', () => ({ default: ({ meets, saving }: { meets: MeetDto[]; saving: number[] }) =>
  <output>{meets.map(meet => `${meet.id}:${meet.startedAt}:${meet.duration}:${saving.includes(meet.id)}`).join('|')}</output> }));
import WeekCalendar from './WeekCalendar.tsx';
import { fetchPlace, fetchUpdateMeet } from '../../../requests.ts';
import { moscowDay } from '../moscow-time.ts';

const meet = { id: 1, projectId: 2, startedAt: '2030-01-07T13:00:00Z', duration: 90,
  place: { id: 3 }, passport: { id: 10 } } as MeetDto;
const target = Date.parse('2030-01-08T10:15:00+03:00');
const drop = (timestamp = target): DragEndEvent => ({
  active: { id: 1, data: { current: {} }, rect: { current: { initial: null, translated: null } } },
  over: { id: `slot-${timestamp}`, data: { current: { timestamp } }, rect: new DOMRect(), disabled: false },
  activatorEvent: new MouseEvent('mouseup'), collisions: null, delta: { x: 0, y: 0 },
});
beforeEach(() => {
  vi.resetAllMocks(); Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.mocked(fetchPlace).mockResolvedValue({ schedule: Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, enabled: true, startTime: '08:00', endTime: '20:00' })) } as PlaceDto);
  vi.mocked(fetchUpdateMeet).mockResolvedValue(undefined);
});

async function calendar(editing: boolean, placeId = 3) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host); const root = createRoot(host);
  await act(async () => root.render(<QueryClientProvider client={client}><WeekCalendar meets={[meet]} visibleDays={[moscowDay(meet.startedAt), moscowDay(target)]} editing={editing} management={{ placeId }} /></QueryClientProvider>));
  return { client, host, close: async () => { await act(async () => root.unmount()); host.remove(); client.clear(); } };
}

it.each([[false, 3], [true, 9]])('does not save a drop outside edit mode or management: %s, %s', async (editing, placeId) => {
  const view = await calendar(editing, placeId);
  try { await act(async () => dnd.onDragEnd!(drop())); expect(fetchUpdateMeet).not.toHaveBeenCalled(); }
  finally { await view.close(); }
});

it('saves only the start with +03:00, keeps duration, locks repeat drops and rolls back on conflict', async () => {
  let reject: (error: Error) => void = () => {};
  vi.mocked(fetchUpdateMeet).mockImplementation(() => new Promise((_, rejectPromise) => { reject = rejectPromise; }));
  const view = await calendar(true);
  let operation: Promise<void> | undefined;
  try {
    await act(async () => { operation = dnd.onDragEnd!(drop()); });
    expect(fetchUpdateMeet).toHaveBeenCalledExactlyOnceWith(1, { startedAt: '2030-01-08T10:15:00+03:00' });
    expect(view.host.querySelector('output')?.textContent).toContain('10:15:00+03:00:90:true');
    await act(async () => dnd.onDragEnd!(drop(target + 900000)));
    expect(fetchUpdateMeet).toHaveBeenCalledTimes(1);
    await act(async () => { reject(new Error('Преподаватель занят')); await operation; });
    expect(view.host.textContent).toContain('Преподаватель занят');
    expect(view.host.querySelector('output')?.textContent).toContain('13:00:00Z:90:false');
  } finally { await view.close(); }
});

it('rejects a duration extending beyond opening hours before PUT and refreshes relevant views on success', async () => {
  const view = await calendar(true); const invalidate = vi.spyOn(view.client, 'invalidateQueries');
  try {
    await act(async () => dnd.onDragEnd!(drop(Date.parse('2030-01-08T19:00:00+03:00'))));
    expect(fetchUpdateMeet).not.toHaveBeenCalled(); expect(view.host.textContent).toContain('часы работы');
    await act(async () => dnd.onDragEnd!(drop()));
    for (const queryKey of [['meets'], ['project', '2'], ['place-dashboard'], ['teacher-meets'], ['place-projects']]) expect(invalidate).toHaveBeenCalledWith({ queryKey });
  } finally { await view.close(); }
});
