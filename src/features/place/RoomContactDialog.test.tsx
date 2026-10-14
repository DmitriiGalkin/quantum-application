// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { PlaceDto, RoomDto } from 'entities';
import { RoomContactDialog } from './RoomContactDialog.tsx';

it('offers contact even for a room without enabled rental and handles missing phone', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  const close = vi.fn();
  const room = { id: 1, title: 'Мастерская', rentalEnabled: false } as RoomDto;
  const place = { title: 'Центр', address: 'Адрес центра', phone: null } as PlaceDto;
  try {
    await act(async () => root.render(<RoomContactDialog room={room} place={place} onClose={close} />));
    const dialog = globalThis.document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Мастерская');
    expect(dialog.textContent).toContain('Телефон центра пока не указан.');
    expect(dialog.textContent).toContain('Адрес центра');
    expect(dialog.querySelector('input')).toBeNull();
    await act(async () => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(close).toHaveBeenCalledOnce();
  } finally { await act(async () => root.unmount()); }
});
