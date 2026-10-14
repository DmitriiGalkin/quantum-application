// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import type { PlaceDto, RoomDto } from 'entities';
import { PlaceGallery } from './PlaceGallery.tsx';

it('hydrates the centre photo first and selects room thumbnails below it', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const place = { title: 'Центр', image: '/centre.jpg' } as PlaceDto;
  const rooms = [{ id: 1, title: 'Зал', photos: [{ id: 1, url: '/room.jpg', locationId: 1, position: 0 }] }] as RoomDto[];
  const app = <PlaceGallery place={place} rooms={rooms} />;
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(app);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, app, { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/centre.jpg');
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Фотография 2: Зал"]')!.click());
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/room.jpg');
    expect(host.querySelector('[aria-label="Фотография 2: Зал"]')?.getAttribute('aria-pressed')).toBe('true');
  } finally { await act(async () => root.unmount()); }
});

it('omits an empty gallery', () => {
  expect(renderToString(<PlaceGallery place={{ image: null } as PlaceDto} rooms={[]} />)).toBe('');
});
