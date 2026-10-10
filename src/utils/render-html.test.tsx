// @vitest-environment jsdom
import { act, lazy, Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { renderHtml } from './render-html.js';

describe('SSR with lazy pages', () => {
  it('waits for page content and hydrates it without replacing server HTML', async () => {
    const Page = lazy(async () => ({ default: () => <main>Loaded page{'.'.repeat(30000)}</main> }));
    const tree = (
      <Suspense fallback={<p>Loading</p>}>
        <Page />
      </Suspense>
    );
    const html = await renderHtml(tree);
    expect(html).toContain('Loaded page');
    expect(html).not.toContain('<p>Loading</p>');
    const container = globalThis.document.createElement('div');
    container.innerHTML = html;
    const main = container.querySelector('main');
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, tree, { onRecoverableError });
    });
    expect(container.querySelector('main')).toBe(main);
    expect(onRecoverableError).not.toHaveBeenCalled();
    await act(async () => root.unmount());
  });

  it('rejects a page import failure instead of returning a loading screen as successful HTML', async () => {
    const Page = lazy(async () => {
      throw new Error('Page import failed');
    });
    await expect(
      renderHtml(
        <Suspense fallback={<p>Loading</p>}>
          <Page />
        </Suspense>,
      ),
    ).rejects.toThrow('Page import failed');
  });
});
