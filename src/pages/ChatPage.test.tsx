// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ passport: null, token: null, isPending: true, authHandler: vi.fn() }));
vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => auth }));
vi.mock('../requests.ts', () => ({ fetchConversations: vi.fn() }));
vi.mock('../components/ConversationPanel.tsx', () => ({ default: () => null }));
import ChatPage from './ChatPage.tsx';
import { fetchConversations } from '../requests.ts';

it('offers login on a direct guest link even when the disabled account query is pending', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient(); const host = globalThis.document.createElement('div'); const root = createRoot(host);
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/chats/7']}><ChatPage /></MemoryRouter></QueryClientProvider>));
    expect(host.textContent).toContain('Войдите, чтобы открыть свои диалоги');
    expect(host.textContent).not.toContain('Загрузка аккаунта');
    expect(fetchConversations).not.toHaveBeenCalled();
    await act(async () => host.querySelector('button')!.click());
    expect(auth.authHandler).toHaveBeenCalledWith('/chats/7');
  } finally { await act(async () => root.unmount()); client.clear(); }
});
