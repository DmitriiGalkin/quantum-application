// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import type { IdeaDto } from '../../../entities/idea.ts';
import IdeaGallery from './IdeaGallery.tsx';

it('shows a generated cover with its label and retains all eight original thumbnails', async () => {
  const originals = Array.from({ length: 8 }, (_, i) => ({ id: `original-${i}`, fileName: `${i}.jpg`, url: `https://example.com/${i}.jpg`, isCover: false }));
  const cover = { id: 'generated', fileName: 'cover.png', url: 'https://example.com/cover.png', isCover: true, origin: 'generated' };
  const idea = { id: 54, title: 'Robot', image: cover.url, photos: [cover, ...originals], user: null, today: false } as IdeaDto;
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(<IdeaGallery idea={idea} />);
  expect(host.querySelectorAll('button[aria-pressed]')).toHaveLength(9);
  expect(host.querySelector('button img')?.getAttribute('src')).toBe(cover.url);
  expect(host.textContent).toContain('Иллюстрация создана с помощью ИИ');
});

it('hydrates all eight imported photos and supports thumbnails, full view and keyboard navigation', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const idea: IdeaDto = { id: 54, title: 'Робот', user: null, today: false, image: 'https://example.com/1.jpg', photos: Array.from({ length: 8 }, (_, i) => ({
    id: `photo-${i + 1}`, fileName: `${i + 1}.jpg`, url: `https://example.com/${i + 1}.jpg`, isCover: i === 0,
    driveFileId: `drive-${i + 1}`, sourceUrl: `https://drive.google.com/${i + 1}`,
  })) };
  const host = globalThis.document.createElement('div');
  globalThis.document.body.append(host);
  host.innerHTML = renderToString(<IdeaGallery idea={idea} />);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, <IdeaGallery idea={idea} />, { onRecoverableError: error => errors.push(error) });
  const click = async (selector: string) => act(async () => { globalThis.document.querySelector<HTMLButtonElement>(selector)!.click(); });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    expect(host.querySelectorAll('button[aria-pressed]')).toHaveLength(8);
    await click('button[aria-label="Фотография 8"]');
    expect(host.querySelector('button[aria-label="Открыть фотографию"] img')?.getAttribute('src')).toBe(idea.photos[7].url);
    await click('button[aria-label="Открыть фотографию"]');
    const dialog = globalThis.document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('8 / 8');
    await act(async () => { dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); });
    expect(dialog.textContent).toContain('1 / 8');
    await act(async () => { dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 250)); });
    expect(globalThis.document.querySelector('[role="dialog"]')).toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); }
});
