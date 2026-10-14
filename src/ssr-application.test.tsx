import { afterEach, describe, expect, it, vi } from 'vitest';
// Routing itself is covered by HTTP tests; this isolates SSR metadata and URL parsing.
vi.mock('./Routers.tsx', () => ({ default: () => <main>Quantum</main> }));
import { render } from './ssr-application.tsx';

afterEach(() => vi.unstubAllGlobals());
describe('SSR metadata', () => {
  it.each(['/', '/projects?q=wood'])('describes the project showcase at %s', async url => {
    const result = await render(url);
    expect(result.meta.title).toBe('Quantum — образовательные проекты для детей');
  });
  it('describes the idea library at its new URL', async () => {
    expect((await render('/ideas?view=module')).meta.title).toBe('Quantum — библиотека идей');
  });
  it('loads public centre metadata through the place API', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ title: 'School', description: 'Bio', ogImage: 'https://example.com/logo.png' }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const result = await render('/places/1?rental=resume');
    expect(fetch.mock.calls[0][0]).toMatch(/\/place\/1\/meta$/);
    expect(result.meta.ogImage).toBe('https://example.com/logo.png');
  });
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
