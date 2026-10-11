// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import type { MeetDto } from 'entities';

const auth = vi.hoisted(() => ({ role: 'user', userId: 7, passport: { id: 10 }, authHandler: vi.fn() }));
vi.mock('../../providers/auth-context.ts', () => ({ useAuth: () => auth }));
vi.mock('../../requests.ts', () => ({
  fetchPlace: vi.fn(), fetchCreateMeetUser: vi.fn(), fetchCreatePayment: vi.fn(), fetchDeleteMeet: vi.fn(),
  fetchDeleteMeetUser: vi.fn(), fetchUpdateMeetStatus: vi.fn(),
}));
vi.mock('./EditMeetDialog.tsx', () => ({ EditMeetDialog: () => null }));
import MeetCard from './MeetCard.tsx';
import { fetchPlace, fetchUpdateMeetStatus } from '../../requests.ts';

const meet = {
  id: 1, projectId: 2, locationId: 4, location: { id: 4, title: 'Мастерская' }, maxParticipants: 12,
  projectTitle: 'Создаём робота', projectImage: 'https://example.test/robot.jpg',
  place: { id: 3, title: 'Центр творчества', address: 'Улица, 1' }, passport: { id: 20, title: 'Анна' },
  startedAt: '2030-01-07T13:00:00Z', duration: 60, price: 500, status: 'published', deletedAt: null,
  users: [{ id: 1 }, { id: 2 }], capacity: 99,
} as MeetDto;

afterEach(() => { auth.role = 'user'; vi.clearAllMocks(); });

it('renders real project/centre/hall data, Moscow time and meeting occupancy during SSR without requesting a centre', () => {
  const client = new QueryClient();
  const html = renderToString(<QueryClientProvider client={client}><MeetCard meet={meet} /></QueryClientProvider>);
  expect(html).toContain('Создаём робота'); expect(html).toContain('robot.jpg');
  expect(html).toContain('Центр творчества'); expect(html).toContain('Мастерская'); expect(html).toContain('Улица, 1');
  expect(html).toContain('16:00'); expect(html).toContain('17:00'); expect(html).toContain('МСК');
  expect(html).toContain('из 12'); expect(html).toContain('17%'); expect(html).toContain('Свободно 10 мест');
  expect(html).not.toContain('99 участников'); expect(fetchPlace).not.toHaveBeenCalled();
  client.clear();
});

it('shows missing hall/limit/image explicitly and omits progress without a limit', () => {
  const client = new QueryClient();
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(<QueryClientProvider client={client}><MeetCard meet={{ ...meet, projectImage: null, location: null, maxParticipants: null, users: [] }} /></QueryClientProvider>);
  expect(host.querySelector('img')).toBeNull(); expect(host.querySelector('[role="progressbar"]')).toBeNull();
  expect(host.textContent).toContain('Зал не выбран'); expect(host.textContent).toContain('Лимит мест не задан');
  expect(host.textContent).toContain('Записано 0'); client.clear();
});

it.each([false, true])('blocks new enrolment at capacity and preserves an existing member action: member=%s', member => {
  const client = new QueryClient();
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(<QueryClientProvider client={client}><MeetCard meet={{ ...meet, maxParticipants: 1, users: [{ id: member ? 7 : 1 }] as MeetDto['users'] }} /></QueryClientProvider>);
  expect(host.textContent).toContain('Мест нет'); expect(host.textContent).toContain('100%');
  const buttons = [...host.querySelectorAll('button')];
  if (member) expect(buttons.find(button => button.textContent === 'Оплатить')?.disabled).toBe(false);
  else expect(buttons.find(button => button.textContent === 'Присоединиться')?.disabled).toBe(true);
  client.clear();
});

it('restricts approval to the managed centre, disables both buttons while saving, and shows a conflict', async () => {
  auth.role = 'place'; Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  let reject: (error: Error) => void = () => {};
  vi.mocked(fetchUpdateMeetStatus).mockImplementation(() => new Promise((_, rejectPromise) => { reject = rejectPromise; }));
  const client = new QueryClient(); const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  const render = (placeId: number) => <QueryClientProvider client={client}><MeetCard meet={{ ...meet, status: 'pending' }} management={{ placeId }} /></QueryClientProvider>;
  try {
    await act(async () => root.render(render(9)));
    expect([...host.querySelectorAll('button')].find(button => button.textContent === 'Подтвердить')).toBeUndefined();
    await act(async () => root.render(render(3)));
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'Подтвердить')!.click(); });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    for (const label of ['Подтвердить', 'Отклонить']) expect([...host.querySelectorAll('button')].find(button => button.textContent === label)?.disabled).toBe(true);
    await act(async () => { reject(new Error('Зал занят')); });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    expect(host.textContent).toContain('Зал занят');
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});
