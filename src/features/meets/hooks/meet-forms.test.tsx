// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, it, vi } from 'vitest';
import type { MeetDto } from 'entities';
vi.mock('../../../requests.ts', () => ({ fetchUpdateMeet: vi.fn(), fetchCreateMeet: vi.fn() }));
import { fetchUpdateMeet, fetchCreateMeet } from '../../../requests.ts';
import { useEditMeet } from './useEditMeet.ts';
import { useCreateMeet } from './useCreateMeet.ts';

beforeEach(() => { vi.resetAllMocks(); Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); });

it('initializes editing in Moscow and keeps the entered hall and limit after a failed save', async () => {
  const client = new QueryClient(); const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host); const onClose = vi.fn(); let hook: ReturnType<typeof useEditMeet>;
  const meet = { id: 1, projectId: 2, startedAt: '2030-01-06T22:15:00Z', duration: null, price: 0, locationId: 5, maxParticipants: null } as MeetDto;
  function Form() { hook = useEditMeet(meet, onClose); return <output>{JSON.stringify(hook.form)}{hook.error}</output>; }
  vi.mocked(fetchUpdateMeet).mockRejectedValue(new Error('Зал занят'));
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><Form /></QueryClientProvider>));
    expect(hook!.form).toMatchObject({ date: '2030-01-07', time: '01:15', duration: 60, locationId: 5, maxParticipants: '' });
    await act(async () => hook!.setForm({ ...hook!.form, locationId: null, maxParticipants: 8, time: '10:15' }));
    await act(async () => hook!.onSubmit());
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    expect(fetchUpdateMeet).toHaveBeenCalledWith(1, expect.objectContaining({ locationId: null, maxParticipants: 8, startedAt: '2030-01-07T10:15:00+03:00' }));
    expect(hook!.form).toMatchObject({ locationId: null, maxParticipants: 8, time: '10:15' });
    expect(host.textContent).toContain('Зал занят'); expect(onClose).not.toHaveBeenCalled();
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});

it('starts creation with the project hall and keeps manually entered capacity after an error', async () => {
  const client = new QueryClient(); const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host); const refresh = vi.fn(); let hook: ReturnType<typeof useCreateMeet>;
  function Form() { hook = useCreateMeet(2, refresh, 5); return <output>{JSON.stringify(hook.form)}{hook.error}</output>; }
  vi.mocked(fetchCreateMeet).mockRejectedValue(new Error('Преподаватель занят'));
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><Form /></QueryClientProvider>));
    expect(hook!.form).toMatchObject({ locationId: 5, maxParticipants: '' });
    await act(async () => hook!.setForm({ ...hook!.form, date: '2030-01-07', time: '10:15', maxParticipants: 12 }));
    await act(async () => hook!.onSubmit());
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    expect(fetchCreateMeet).toHaveBeenCalledWith(expect.objectContaining({ locationId: 5, maxParticipants: 12, startedAt: '2030-01-07T10:15:00+03:00' }));
    expect(hook!.form.maxParticipants).toBe(12); expect(host.textContent).toContain('Преподаватель занят'); expect(refresh).not.toHaveBeenCalled();
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});
