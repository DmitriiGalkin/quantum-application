import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../providers/auth-context.ts';
import { fetchCreateRental, fetchRoomBusy } from '../../../requests.ts';
import { getBrowser } from '../../../shared/lib/browser.ts';
import { meetStart } from '../../../shared/lib/meet-time.ts';
import type { RoomDto } from 'entities';

export interface RentalFormValues {
  locationId: number;
  start: string;
  end: string;
  participants: string;
  comment: string;
}

export function useRentalForm(placeId: number, rooms: RoomDto[]) {
  const { passport, authHandler } = useAuth();
  const [values, setValues] = useState<RentalFormValues>({ locationId: 0, start: '', end: '', participants: '1', comment: '' });
  const [open, setOpen] = useState(false);
  const key = `quantum:rental-draft:${placeId}`;
  const passportId = passport?.id;
  const restore = useCallback(() => {
    const raw = getBrowser()?.sessionStorage.getItem(key);
    if (!raw) return;
    try {
      const draft: unknown = JSON.parse(raw);
      if (typeof draft === 'object' && draft !== null && 'locationId' in draft && typeof draft.locationId === 'number' &&
        'start' in draft && typeof draft.start === 'string' && 'end' in draft && typeof draft.end === 'string' &&
        'participants' in draft && typeof draft.participants === 'string' && 'comment' in draft && typeof draft.comment === 'string') {
        setValues({ locationId: draft.locationId, start: draft.start, end: draft.end, participants: draft.participants, comment: draft.comment });
        setOpen(true);
      }
    } catch { getBrowser()?.sessionStorage.removeItem(key); }
  }, [key]);
  useEffect(() => {
    let active = true;
    // Restore browser storage after hydration; cancel when the centre or account changes.
    if (passportId) queueMicrotask(() => { if (active) restore(); });
    return () => { active = false; };
  }, [passportId, restore]);
  const room = rooms.find(room => room.id === values.locationId);
  const date = values.start.slice(0, 10);
  const busy = useQuery({ queryKey: ['room-busy', values.locationId, date], queryFn: () => fetchRoomBusy(values.locationId, date),
    enabled: open && Boolean(room && /^\d{4}-\d{2}-\d{2}$/.test(date)), staleTime: 0 });
  const mutation = useMutation({ mutationFn: () => fetchCreateRental({ locationId: values.locationId,
    startedAt: meetStart(values.start.slice(0, 10), values.start.slice(11, 16)),
    endedAt: meetStart(values.end.slice(0, 10), values.end.slice(11, 16)), participants: Number(values.participants), comment: values.comment }),
  onSuccess: () => { getBrowser()?.sessionStorage.removeItem(key); void busy.refetch(); } });
  const submit = () => {
    if (!passport) {
      getBrowser()?.sessionStorage.setItem(key, JSON.stringify(values));
      authHandler(`/places/${placeId}?rental=resume`);
    } else mutation.mutate();
  };
  const choose = (id: number) => { mutation.reset(); setValues(current => ({ ...current, locationId: id })); setOpen(true); };
  return { values, setValues, open, setOpen, choose, restore, room, busy, mutation, submit, passport };
}
