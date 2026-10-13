// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { createMemoryRouter, RouterProvider, MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useFilters } from './useFilters';

function ProjectProbe({ projects = true }: { projects?: boolean }) {
  const filter = useFilters({ projects, defaultView: 'table' });
  const location = useLocation();
  return <><output>{filter.filters.view}|{location.search}</output><button onClick={() => filter.setView('table')}>table</button><button onClick={() => filter.setView('module')}>module</button></>;
}

function Probe() {
  const { filters, setView, setSort, setWhen } = useFilters();
  const location = useLocation();
  const navigate = useNavigate();
  return <>
    <output>{JSON.stringify({ ...filters, search: location.search })}</output>
    <button onClick={() => setSort('popular')}>sort</button>
    <button onClick={() => setView('map')}>view</button>
    <button onClick={() => setWhen('tomorrow')}>date</button>
    <button onClick={() => setWhen(undefined)}>clear</button>
    <button onClick={() => navigate(-1)}>back</button>
    <button onClick={() => navigate(1)}>forward</button>
  </>;
}

describe('idea filters in router history', () => {
  it('restores each filter on back, forward and reload, preserving unrelated parameters', async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const host = globalThis.document.createElement('div');
    const root = createRoot(host);
    const router = createMemoryRouter([{ path: '/', element: <Probe /> }], { initialEntries: ['/?tag=craft'] });
    const click = async (label: string) => { await act(async () => { [...host.querySelectorAll('button')].find(node => node.textContent === label)!.click(); }); };
    const state = () => JSON.parse(host.querySelector('output')!.textContent!);
    try {
      await act(async () => { root.render(<RouterProvider router={router} />); });
      expect(state().sort).toBe('new');
      await click('sort'); await click('view'); await click('date');
      expect(state()).toMatchObject({ sort: 'popular', view: 'map', when: 'tomorrow' });
      expect(state().search).toContain('tag=craft');
      await click('back'); expect(state().when).toBeUndefined();
      await click('back'); expect(state().view).toBe('module');
      await click('forward'); await click('forward');
      expect(state().when).toBe('tomorrow');
      const reload = createMemoryRouter([{ path: '/', element: <Probe /> }], { initialEntries: [router.state.location.search] });
      await act(async () => { root.render(<RouterProvider router={reload} />); });
      expect(state()).toMatchObject({ sort: 'popular', view: 'map', when: 'tomorrow' });
      await click('clear'); expect(state().when).toBeUndefined();
      reload.dispose();
    } finally { await act(async () => root.unmount()); router.dispose(); }
  });
  it('reads URL filters during server rendering without browser globals', () => {
    expect(renderToString(<MemoryRouter initialEntries={['/?sort=nearby&view=map&when=today']}><Probe /></MemoryRouter>)).toContain('&quot;sort&quot;:&quot;nearby&quot;');
  });
  it('defaults project pages to table, respects explicit views, and rejects table for ideas', () => {
    const html = (search: string, projects = true) => renderToString(<MemoryRouter initialEntries={['/' + search]}><ProjectProbe projects={projects} /></MemoryRouter>).replaceAll('<!-- -->', '');
    expect(html('')).toContain('table|');
    expect(html('?view=module')).toContain('module|');
    expect(html('?view=table', false)).toContain('module|');
  });
  it('switches table without losing any project filters', async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const host = globalThis.document.createElement('div');
    const root = createRoot(host);
    try {
      await act(async () => root.render(<MemoryRouter initialEntries={['/?view=module&sort=popular&when=tomorrow&placeId=9']}><ProjectProbe /></MemoryRouter>));
      await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
      const output = host.querySelector('output')!.textContent!;
      expect(output).toContain('table|');
      for (const param of ['sort=popular', 'when=tomorrow', 'placeId=9', 'view=table']) expect(output).toContain(param);
    } finally { await act(async () => root.unmount()); }
  });
});
