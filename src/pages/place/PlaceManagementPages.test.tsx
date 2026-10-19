// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { RoomDto } from 'entities';

const auth = vi.hoisted(() => ({ placeId: 597, role: 'place', passport: { id: 44, places: [{ id: 597 }] } }));
vi.mock('../../providers/auth-context.ts', () => ({ useAuth: () => auth }));
vi.mock('../../requests.ts', () => ({
  fetchPlaceTeachers: vi.fn(async () => []), fetchAddTeacher: vi.fn(), fetchRemoveTeacher: vi.fn(async () => true),
  fetchLeavePlace: vi.fn(async () => true), fetchPlaceLocations: vi.fn(async () => []),
}));
vi.mock('../../features/place/CreateLocationDialog.tsx', () => ({ CreateLocationDialog: () => null }));
vi.mock('../../features/place/RoomEditor.tsx', () => ({ RoomEditor: ({ room }: { room: RoomDto }) => <div role="dialog">Редактор: {room.title}</div> }));
import PlaceTeachersPage from './PlaceTeachersPage.tsx';
import PlaceLocationsPage from './PlaceLocationsPage.tsx';
import { fetchRemoveTeacher, fetchLeavePlace } from '../../requests.ts';

const teacher = { id: 44, title: 'Анна', description: 'Преподаватель ремесла', image: 'https://example.com/anna.png' };
const room: RoomDto = { id: 5, placeId: 597, title: 'Мастерская', description: 'Светлый зал', capacity: 12,
  hourlyRate: 1000, deletedAt: null,
  photos: [{ id: 1, locationId: 5, position: 0, url: 'https://example.com/room.png' }] };

function setup(page: 'teachers' | 'rooms') {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  client.setQueryData(['place-teachers', 597], [teacher]);
  client.setQueryData(['place-locations', 597], [room]);
  const app = <QueryClientProvider client={client}><MemoryRouter>{page === 'teachers' ? <PlaceTeachersPage /> : <PlaceLocationsPage />}</MemoryRouter></QueryClientProvider>;
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  return { client, app, host, root, async cleanup() { await act(async () => root.unmount()); host.remove(); client.clear(); } };
}

it('renders teacher details and profile in SSR without a browser', async () => {
  const state = setup('teachers');
  const browser = globalThis.window;
  try {
    vi.stubGlobal('window', undefined);
    const html = renderToString(state.app);
    expect(html).toContain('Преподаватель ремесла');
    expect(html).toContain('href="/teachers/44"');
    expect(html).toContain(teacher.image);
  } finally { vi.stubGlobal('window', browser); await state.cleanup(); }
});

it('preserves remove and leave actions only for the eligible role and teacher', async () => {
  auth.role = 'place';
  vi.mocked(fetchRemoveTeacher).mockClear(); vi.mocked(fetchLeavePlace).mockClear();
  const state = setup('teachers');
  try {
    await act(async () => state.root.render(state.app));
    await act(async () => state.host.querySelector<HTMLButtonElement>('.MuiCard-root button')!.click());
    const remove = [...globalThis.document.querySelectorAll('[role="menuitem"]')].find(item => item.textContent === 'Удалить из центра');
    expect(remove).toBeDefined();
    await act(async () => (remove as HTMLElement).click());
    expect(fetchRemoveTeacher).toHaveBeenCalledWith(597, 44);
    // The refetch returns an empty list; restore it before checking teacher mode.
    auth.role = 'teacher';
    await act(async () => {
      state.client.setQueryData(['place-teachers', 597], [teacher]);
      state.root.render(<QueryClientProvider client={state.client}><MemoryRouter><PlaceTeachersPage /></MemoryRouter></QueryClientProvider>);
    });
    await act(async () => state.host.querySelector<HTMLButtonElement>('.MuiCard-root button')!.click());
    expect([...globalThis.document.querySelectorAll('[role="menuitem"]')].some(item => item.textContent === 'Удалить из центра')).toBe(false);
    const leave = [...globalThis.document.querySelectorAll('[role="menuitem"]')].find(item => item.textContent === 'Выйти из центра');
    expect(leave).toBeDefined();
    await act(async () => (leave as HTMLElement).click());
    expect(fetchLeavePlace).toHaveBeenCalledWith(597);
  } finally { auth.role = 'place'; await state.cleanup(); }
});

it('reuses room photographs and details while opening the existing editor', async () => {
  const state = setup('rooms');
  try {
    await act(async () => state.root.render(state.app));
    expect(state.host.textContent).toContain('Светлый зал');
    expect(state.host.textContent).toContain('Вместимость: 12 человек');
    expect(state.host.querySelector('#room-5 img')?.getAttribute('src')).toBe(room.photos[0].url);
    expect(state.host.textContent).not.toContain('Арендовать');
    await act(async () => [...state.host.querySelectorAll('button')].find(button => button.textContent === 'Редактировать зал')!.click());
    expect(state.host.querySelector('[role="dialog"]')?.textContent).toBe('Редактор: Мастерская');
  } finally { await state.cleanup(); }
});
