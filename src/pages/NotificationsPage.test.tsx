// @vitest-environment jsdom
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { AppNotification, NotificationPage } from 'entities';

vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => ({ passport: { id: 1 }, token: 'token', isPending: false, authHandler: vi.fn() }) }));
vi.mock('../requests.ts', () => ({
  fetchNotifications: vi.fn(), fetchReadNotification: vi.fn(), fetchPushConfig: vi.fn(),
  fetchPushSubscribe: vi.fn(), fetchPushUnsubscribe: vi.fn(),
}));

import NotificationsPage from './NotificationsPage.tsx';

it('visibly distinguishes unread and read notifications without marking them on list view', () => {
  const unread: AppNotification = { id: 2, passportId: 1, title: 'Встреча перенесена', body: 'Новое время', url: '/project/3', readAt: null, createdAt: '2026-10-21T10:00:00.000Z' };
  const read: AppNotification = { ...unread, id: 1, title: 'Зал подтверждён', readAt: '2026-10-21T11:00:00.000Z' };
  const client = new QueryClient();
  client.setQueryData(['notifications', 1, false], { pages: [{ items: [unread, read], nextCursor: null } satisfies NotificationPage], pageParams: [null] });
  const html = renderToString(<QueryClientProvider client={client}><MemoryRouter><NotificationsPage /></MemoryRouter></QueryClientProvider>);
  const host = globalThis.document.createElement('div');
  host.innerHTML = html;
  expect(host.textContent).toContain('Встреча перенесена');
  expect(host.querySelectorAll('.MuiChip-root')).toHaveLength(1);
  expect(host.textContent).toContain('Отметить прочитанным');
  expect([...host.querySelectorAll('button')].filter(button => button.textContent === 'Отметить прочитанным')).toHaveLength(1);
});
