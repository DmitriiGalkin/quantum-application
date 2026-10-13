// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { RoomGallery } from './RoomGallery.tsx';

it('hydrates the main photo and supports keyboard navigation, wrapping and Escape', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const photos = [1, 2].map(id => ({ id, locationId: 1, position: id - 1, url: `https://example.com/${id}.png` }));
  const host = globalThis.document.createElement('div');
  globalThis.document.body.append(host);
  host.innerHTML = renderToString(<RoomGallery title="Зал" photos={photos} />);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, <RoomGallery title="Зал" photos={photos} />, { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    expect(host.querySelector('img')?.getAttribute('src')).toBe(photos[0].url);
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    const dialog = globalThis.document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('1 / 2');
    await act(async () => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })));
    expect(dialog.textContent).toContain('2 / 2');
    await act(async () => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    expect(dialog.textContent).toContain('1 / 2');
    await act(async () => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 250)); });
    expect(globalThis.document.querySelector('[role="dialog"]')).toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); }
});
