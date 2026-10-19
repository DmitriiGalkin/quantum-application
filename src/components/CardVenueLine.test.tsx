// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, it } from 'vitest';
import CardVenueLine from './CardVenueLine.tsx';

function Location() { return <output>{useLocation().pathname}</output>; }

it('keeps the address hidden until the center name is used and preserves a separate center link', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const card = () => <MemoryRouter><CardVenueLine id={3} title="Центр" address="Улица, дом 1" room="Мастерская" /><Location /></MemoryRouter>;
  const serverHost = globalThis.document.createElement('div');
  serverHost.innerHTML = renderToString(card());
  expect(serverHost.textContent).not.toContain('Улица, дом 1');
  expect(serverHost.textContent).toContain('Центр · Мастерская');

  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(card()));
    const trigger = host.querySelector<HTMLButtonElement>('[aria-label="Показать адрес центра Центр"]')!;
    await act(async () => {
      trigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    await act(async () => trigger.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await act(async () => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(globalThis.document.querySelector('[role="tooltip"]')?.textContent).toBe('Улица, дом 1');
    await act(async () => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await act(async () => host.querySelector<HTMLAnchorElement>('a[aria-label="Открыть страницу центра Центр"]')!.click());
    expect(host.querySelector('output')?.textContent).toBe('/places/3');
  } finally { await act(async () => root.unmount()); host.remove(); }
});
