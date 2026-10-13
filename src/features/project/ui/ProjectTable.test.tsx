// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import type { ProjectDto } from '../../../entities/project.ts';
import type { MeetDto } from '../../../entities/meet.ts';
import ProjectTable from './ProjectTable.tsx';
import AvatarGroupUsers from '../../../components/AvatarGroupUsers.tsx';

it('hydrates compact rows with independent links, public meetings, and ten real participant images', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const place = { id: 9, title: 'Center', address: 'Address', description: null, latitude: 0, longitude: 0, priceFrom: null };
  const users = Array.from({ length: 13 }, (_, id) => ({ id, title: `User ${id}`, age: null, image: `/users/${id}.jpg` }));
  const meeting = { id: 7, projectId: 1, startedAt: '2099-01-01T22:00:00Z', duration: 45, price: 0, deletedAt: null, status: 'published' } as MeetDto;
  const project: ProjectDto = { id: 1, title: 'A long project title '.repeat(8), description: 'Long description '.repeat(30), image: null,
    place, passport: { id: 42, title: 'Teacher', description: null }, users, idea: null,
    meets: [{ ...meeting, id: 8, startedAt: '2098-01-01T22:00:00Z', status: 'pending' }, meeting] };
  const render = () => <MemoryRouter><ProjectTable projects={[project, { ...project, id: 2, users: [], meets: [] }]} /></MemoryRouter>;
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  host.innerHTML = renderToString(render());
  const errors: unknown[] = [];
  const root = hydrateRoot(host, render(), { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    const row = host.querySelector('article')!;
    expect([...row.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['/project/1', '/teachers/42', '/places/9', '/project/1#meet-7']);
    expect(row.textContent).toContain('02 января 2099');
    expect(row.textContent).toContain('01:00 МСК');
    expect(row.textContent).toContain('45 минут · 0 ₽');
    expect(row.querySelectorAll('img[src^="/users/"]')).toHaveLength(10);
    expect(row.textContent).toContain('+3');
    expect(host.textContent).toContain('Ближайшая встреча не назначена');
    expect(host.textContent).toContain('Пока нет участников');
    expect(row.querySelector('a a')).toBeNull();
    const defaults = globalThis.document.createElement('div');
    defaults.innerHTML = renderToString(<AvatarGroupUsers users={users} />);
    expect(defaults.querySelectorAll('img')).toHaveLength(4);
    expect(defaults.textContent).toContain('+9');
  } finally { await act(async () => root.unmount()); host.remove(); }
});
