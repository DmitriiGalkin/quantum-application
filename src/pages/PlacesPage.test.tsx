// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { PlaceProfile } from 'entities';

vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => ({ passport: null, authHandler: vi.fn() }) }));
vi.mock('../requests.ts', () => ({ fetchPlaceProfile: vi.fn(), fetchProjects: vi.fn(async () => []) }));
vi.mock('../features/place/ui/PlaceMap.tsx', () => ({ PlaceMap: () => <div>Карта центра</div> }));
import PlacesPage from './PlacesPage.tsx';
import { fetchPlaceProfile } from '../requests.ts';

const profile: PlaceProfile = {
  place: { id: 1, title: 'Центр', description: 'Описание центра', image: 'https://example.com/logo.png', address: 'Адрес центра', latitude: 55, longitude: 37, phone: '+79990000000', priceFrom: null },
  rooms: [{ id: 1, placeId: 1, title: 'Зал', deletedAt: null, description: null, capacity: null, hourlyRate: null, photos: [] }],
  meets: [], teachers: [], schedule: [{ weekday: 1, enabled: true, startTime: '08:00:00', endTime: '20:00:00' }],
};

it('renders every public section, empty messages, optional room fields and hydrates consistently', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  client.setQueryData(['place-profile', '1'], profile);
  client.setQueryData(['projects', '1', { sort: 'new', view: 'module', when: undefined }], []);
  const app = <QueryClientProvider client={client}><MemoryRouter initialEntries={['/places/1']}><Routes><Route path="places/:id" element={<PlacesPage />} /></Routes></MemoryRouter></QueryClientProvider>;
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  host.innerHTML = renderToString(app);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, app, { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    expect(host.querySelector('h1')?.textContent).toBe('Центр');
    expect(host.querySelector('img')?.getAttribute('alt')).toBe('Центр');
    for (const section of ['projects', 'rooms', 'directions']) {
      expect(host.querySelector(`a[href="#${section}"]`)).not.toBeNull();
      expect(host.querySelector(`#${section}`)).not.toBeNull();
    }
    for (const text of ['Проекты центра', 'Преподаватели', 'Залы', 'Как добраться', 'Режим работы', 'Проектов центра пока нет.', 'Преподаватели пока не добавлены.', '08:00–20:00']) expect(host.textContent).toContain(text);
    expect(host.textContent).not.toContain('Цена по согласованию');
    expect(host.textContent).not.toContain('Ближайшие занятия');
    expect(host.querySelector('[href="#upcoming"]')).toBeNull();
    expect(host.textContent).not.toContain('Вместимость:');
    expect(host.querySelector('a[href^="tel:"]')?.textContent).toBe('+79990000000');
    expect([...host.querySelectorAll('button')].find(button => button.textContent === 'Арендовать')).toBeUndefined();
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});

it('shows the shared teacher card publicly without management actions', () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  client.setQueryData(['place-profile', '1'], { ...profile, teachers: [{ id: 44, title: 'Анна', description: 'Ремесло', image: 'https://example.com/teacher.png' }] });
  client.setQueryData(['projects', '1', { sort: 'new', view: 'module', when: undefined }], []);
  try {
    const html = renderToString(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/places/1']}><Routes><Route path="places/:id" element={<PlacesPage />} /></Routes></MemoryRouter></QueryClientProvider>);
    expect(html).toContain('Ремесло');
    expect(html).toContain('href="/teachers/44"');
    expect(html).toContain('https://example.com/teacher.png');
    expect(html).not.toContain('Удалить из центра');
    expect(html).not.toContain('Выйти из центра');
  } finally { client.clear(); }
});

it('shows centre-not-found with a retry action after a failed request', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.mocked(fetchPlaceProfile).mockRejectedValue(new Error('Центр не найден'));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div');
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(host);
  try {
    await act(async () => {
      root.render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/places/404']}><Routes><Route path="places/:id" element={<PlacesPage />} /></Routes></MemoryRouter></QueryClientProvider>);
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    expect(host.textContent).toContain('Центр не найден');
    expect(host.querySelector('button')?.textContent).toBe('Повторить');
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});
