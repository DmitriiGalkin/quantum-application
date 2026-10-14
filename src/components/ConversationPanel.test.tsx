// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => ({ passport: { id: 10 } }) }));
vi.mock('../requests.ts', () => ({ fetchConversation: vi.fn(), fetchCreateMessage: vi.fn() }));
import { fetchConversation, fetchCreateMessage } from '../requests.ts';
import ConversationPanel from './ConversationPanel.tsx';

beforeEach(() => vi.resetAllMocks());
const flush = () => new Promise(resolve => setTimeout(resolve, 20));

async function mountPanel() {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  await act(async () => root.render(<QueryClientProvider client={client}><ConversationPanel conversationId={7} /></QueryClientProvider>));
  await act(flush);
  return { host, client, dispose: async () => { await act(async () => root.unmount()); client.clear(); } };
}

it('retains a failed message and clears it only after a successful retry', async () => {
  vi.mocked(fetchConversation).mockResolvedValue({ conversation: { id: 7, passportId: 10, createdAt: '', counterpart: { id: 20, title: 'Учитель', description: null } }, messages: [] });
  vi.mocked(fetchCreateMessage).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({
    id: 1, conversationId: 7, senderPassportId: 10, text: 'Здравствуйте', createdAt: new Date(), updatedAt: new Date(),
  });
  const panel = await mountPanel();
  try {
    const input = panel.host.querySelector('textarea')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(globalThis.HTMLTextAreaElement.prototype, 'value')!.set!.call(input, '  Здравствуйте  ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const submit = async () => { await act(async () => {
      panel.host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await flush();
    }); };
    await submit();
    expect(fetchCreateMessage).toHaveBeenLastCalledWith(7, 'Здравствуйте');
    expect(input.value).toBe('  Здравствуйте  ');
    expect(panel.host.textContent).toContain('Текст сохранён');
    await submit();
    expect(input.value).toBe('');
    expect(fetchConversation).toHaveBeenCalledTimes(2);
  } finally { await panel.dispose(); }
});

it('does not expose a send form when conversation access is denied', async () => {
  vi.mocked(fetchConversation).mockRejectedValue(new Error('Forbidden'));
  const panel = await mountPanel();
  try {
    expect(panel.host.textContent).toContain('Диалог недоступен');
    expect(panel.host.querySelector('form')).toBeNull();
    expect(fetchCreateMessage).not.toHaveBeenCalled();
  } finally { await panel.dispose(); }
});
