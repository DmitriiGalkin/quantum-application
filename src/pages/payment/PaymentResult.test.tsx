// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, it, vi } from 'vitest';
import type { PaymentDto, PaymentStatus } from 'entities';
const auth = vi.hoisted(() => ({ passport: { id: 1 } as { id: number } | null, token: 'test', isPending: false, authHandler: vi.fn() }));
vi.mock('../../providers/auth-context.ts', () => ({ useAuth: () => auth }));
vi.mock('../../requests.ts', () => ({ fetchPayment: vi.fn() }));
import { fetchPayment } from '../../requests.ts';
import PaymentResult from './PaymentResult.tsx';

beforeEach(() => { vi.resetAllMocks(); auth.passport = { id: 1 }; Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); });
async function render(path: string, check: (host: HTMLDivElement) => void | Promise<void>, failed = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><PaymentResult failed={failed} /></MemoryRouter></QueryClientProvider>));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    await check(host);
  } finally { await act(async () => root.unmount()); client.clear(); host.remove(); }
}

it.each<[PaymentStatus, string]>([['paid', 'Оплата подтверждена'], ['pending', 'Ожидаем подтверждения оплаты'], ['failed', 'Оплата не выполнена'], ['canceled', 'Платёж отменён'], ['refunded', 'Оформлен возврат оплаты']])('uses API status %s and amount instead of the success URL', async (status, title) => {
  vi.mocked(fetchPayment).mockResolvedValue({ id: 7, amount: 650, status, meet: null } as PaymentDto);
  await render('/payment/success?InvId=7&OutSum=1', host => {
    expect(host.querySelector('h1')?.textContent).toBe(title);
    expect(host.textContent).toContain('650');
    expect(host.textContent).not.toContain('Сумма: 1');
    expect(fetchPayment).toHaveBeenCalledWith(7);
  });
});

it.each(['', '?InvId=-1', '?InvId=invalid'])('does not claim success or request an invalid invoice %s', async query => {
  await render('/payment/success' + query, host => {
    expect(host.textContent).toContain('Номер платежа не указан или некорректен');
    expect(host.textContent).not.toContain('Оплата подтверждена');
    expect(fetchPayment).not.toHaveBeenCalled();
  });
});

it('asks the account owner to log in before reading a payment', async () => {
  auth.passport = null;
  await render('/payment/success?InvId=7', async host => {
    expect(fetchPayment).not.toHaveBeenCalled();
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Войти и проверить оплату')!.click());
    expect(auth.authHandler).toHaveBeenCalled();
  });
});

it('keeps an unknown status distinct from a failed payment', async () => {
  vi.mocked(fetchPayment).mockRejectedValue(new Error('Offline'));
  await render('/payment/success?InvId=7', host => {
    expect(host.textContent).toContain('Статус платежа пока неизвестен');
    expect(host.textContent).not.toContain('Оплата подтверждена');
  });
});
