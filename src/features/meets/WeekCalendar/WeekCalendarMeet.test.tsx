// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { MeetDto } from '../../../entities/meet.ts';
vi.mock('../../../providers/auth-context.ts', () => ({ useAuth: () => ({ role: 'place' }) }));
vi.mock('@dnd-kit/core', () => ({ useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null }) }));
import WeekCalendarMeet from './WeekCalendarMeet.tsx';

it('opens a pending meeting for the centre to propose a venue price', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const queryClient = new QueryClient();
  const onClick = vi.fn();
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  const meet = { id: 120, projectId: 160, startedAt: '2026-10-12T13:00:00Z', duration: 60, status: 'pending', place: { id: 3 } } as MeetDto;
  try {
    await act(async () => root.render(<QueryClientProvider client={queryClient}><WeekCalendarMeet meet={meet} top={0} height={72} onClick={onClick} management={{ placeId: 3 }} /></QueryClientProvider>));
    expect(host.textContent).toContain('16:00 — 17:00');
    expect(host.textContent).toContain('На подтверждении');
    expect(host.querySelector('[aria-label="Подтвердить"]')).toBeNull();
    await act(async () => { host.querySelector<HTMLElement>('[role="button"]')!.click(); });
    expect(onClick).toHaveBeenCalledOnce();
  } finally { await act(async () => root.unmount()); host.remove(); queryClient.clear(); }
});
