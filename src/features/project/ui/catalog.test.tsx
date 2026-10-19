// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import type { MeetDto, ProjectDto } from 'entities';
import ProjectTable from './ProjectTable.tsx';
import ProjectSearch from './ProjectSearch.tsx';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const place = { id: 9, title: 'Центр встречи', address: 'Адрес встречи', description: null, latitude: 0, longitude: 0, priceFrom: null };
const meet = { id: 7, startedAt: '2099-01-01T22:00:00Z', status: 'published', deletedAt: null, duration: 45, price: 0, place } as MeetDto;
const project: ProjectDto = { id: 1, title: 'Длинное название '.repeat(12), description: 'Описание '.repeat(40), image: null,
  passport: { id: 42, title: 'Учитель', description: null }, place: { ...place, id: 10, title: 'Другой центр' },
  meets: [meet], users: [{ id: 1, title: 'Ученик', image: '/users/1.jpg', age: null }], idea: null };

it('hydrates the catalog table with independent links and no participant faces', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const render = () => <MemoryRouter><ProjectTable projects={[project]} catalog /></MemoryRouter>;
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(render());
  const errors: unknown[] = [];
  const root = hydrateRoot(host, render(), { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    const links = [...host.querySelectorAll('a')].map(a => a.getAttribute('href'));
    for (const href of ['/project/1', '/teachers/42', '/places/9', '/project/1#meet-7']) expect(links).toContain(href);
    expect(host.querySelector('a a')).toBeNull();
    expect(host.querySelector('img[src^="/users/"]')).toBeNull();
    expect(host.textContent).toContain('Бесплатно');
    expect(host.textContent).not.toContain('45 минут');
    expect(host.textContent).not.toContain('Другой центр');
  } finally { await act(async () => root.unmount()); }
});

it('keeps animated hints out of the value and stops them on keyboard focus', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(globalThis.window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: false })) });
  vi.useFakeTimers();
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  const search = vi.fn();
  try {
    await act(async () => root.render(<ProjectSearch initialQuery="" example="Столярное дело" onSearch={search} />));
    await act(async () => { vi.advanceTimersByTime(90); });
    const input = host.querySelector('input')!;
    expect(input.placeholder).toBe('Ст');
    expect(input.value).toBe('');
    await act(async () => input.focus());
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(input.placeholder).toBe('Что интересно ребёнку?');
    await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(search).toHaveBeenCalledWith('');
  } finally { await act(async () => root.unmount()); host.remove(); }
});

it('does not animate with reduced motion or overwrite a restored query', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const media = vi.fn(() => ({ matches: true }));
  Object.defineProperty(globalThis.window, 'matchMedia', { configurable: true, value: media });
  vi.useFakeTimers();
  const host = globalThis.document.createElement('div'); const root = createRoot(host);
  try {
    await act(async () => root.render(<ProjectSearch initialQuery="" example="Вышивка" onSearch={() => {}} />));
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => root.render(<ProjectSearch key="restored" initialQuery="Мяч" example="Вышивка" onSearch={() => {}} />));
    expect(host.querySelector('input')!.value).toBe('Мяч');
  } finally { await act(async () => root.unmount()); }
});
