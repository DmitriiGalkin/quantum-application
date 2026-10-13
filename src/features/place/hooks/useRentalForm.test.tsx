// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, it, vi } from 'vitest';
import type { PassportExtendedDto, RoomDto } from 'entities';
import { useRentalForm } from './useRentalForm.ts';

const auth = vi.hoisted(() => ({ passport: null as PassportExtendedDto | null, authHandler: vi.fn() }));
vi.mock('../../../providers/auth-context.ts', () => ({ useAuth: () => auth }));
vi.mock('../../../requests.ts', () => ({ fetchCreateRental: vi.fn(), fetchRoomBusy: vi.fn(async () => []) }));
import { fetchCreateRental } from '../../../requests.ts';

const rooms: RoomDto[] = [{ id: 1, placeId: 3, title: 'Hall', description: null, deletedAt: null, capacity: 10, hourlyRate: null, rentalEnabled: true, photos: [] }];
function Form() {
  const form = useRentalForm(3, rooms);
  return <><button onClick={() => { form.choose(1); form.setValues({ locationId: 1, start: '2099-01-05T10:00', end: '2099-01-05T11:00', participants: '8', comment: 'Saved comment' }); }}>Fill</button>
    <button onClick={form.submit}>Submit</button><output>{JSON.stringify({ values: form.values, open: form.open })}</output></>;
}
beforeEach(() => { auth.passport = null; vi.clearAllMocks(); globalThis.sessionStorage.clear(); Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); });

it('preserves the centre, room and form through sign-in without hydration mismatch or automatic submission', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const app = <QueryClientProvider client={client}><Form /></QueryClientProvider>;
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  host.innerHTML = renderToString(app);
  const errors: unknown[] = [];
  let root = hydrateRoot(host, app, { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    await act(async () => host.querySelectorAll<HTMLButtonElement>('button')[0].click());
    await act(async () => host.querySelectorAll<HTMLButtonElement>('button')[1].click());
    expect(auth.authHandler).toHaveBeenCalledWith('/places/3?rental=resume');
    expect(fetchCreateRental).not.toHaveBeenCalled();
    const saved = JSON.parse(globalThis.sessionStorage.getItem('quantum:rental-draft:3')!);
    expect(saved.comment).toBe('Saved comment');
    await act(async () => root.unmount());
    auth.passport = { id: 10, title: 'Teacher', description: null, users: [], places: [], isTeacher: true };
    host.innerHTML = renderToString(app);
    root = hydrateRoot(host, app, { onRecoverableError: error => errors.push(error) });
    await act(async () => {});
    expect(errors).toEqual([]);
    expect(JSON.parse(host.querySelector('output')!.textContent!)).toEqual({ values: saved, open: true });
    expect(fetchCreateRental).not.toHaveBeenCalled();
    vi.mocked(fetchCreateRental).mockResolvedValueOnce(1);
    await act(async () => host.querySelectorAll<HTMLButtonElement>('button')[1].click());
    expect(fetchCreateRental).toHaveBeenCalledWith({ locationId: 1, startedAt: '2099-01-05T10:00:00+03:00', endedAt: '2099-01-05T11:00:00+03:00', participants: 8, comment: 'Saved comment' });
    expect(globalThis.sessionStorage.getItem('quantum:rental-draft:3')).toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});
