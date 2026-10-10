import { afterEach, describe, expect, it, vi } from 'vitest';
// Routing itself is covered by HTTP tests; this isolates SSR metadata and URL parsing.
vi.mock('./Routers.tsx', () => ({ default: () => <main>Quantum</main> }));
import { render } from './ssr-application.tsx';

afterEach(() => vi.unstubAllGlobals());
describe('SSR metadata', () => {
  it.each(['idea/toy-001', 'project/1'])('loads metadata for /%s without including query parameters', async path => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ title: 'Card', description: 'Description', ogTitle: 'Card' }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const result = await render('/' + path + '?sort=new');
    expect(fetch.mock.calls[0][0]).toMatch(new RegExp('/' + path + '/meta$'));
    expect(result.meta.title).toBe('Card');
    expect(result.html).toContain('Quantum');
  });

  it('uses default metadata when the card does not exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })));
    expect((await render('/idea/missing')).meta.title).toBe('Quantum');
  });
});
