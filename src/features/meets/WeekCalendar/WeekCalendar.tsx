import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DndContext, MouseSensor, TouchSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useQueryClient } from '@tanstack/react-query';
import { fetchPlace, fetchUpdateMeet } from '../../../requests.ts';
import { invalidateMeetQueries } from '../hooks/queries.ts';
import { canManageMeet, type MeetManagement } from '../management.ts';
import { meetStart, moscowInput, withinPlaceHours } from '../../../shared/lib/meet-time.ts';
import { calendarKeyboardCoordinates, slotCollision } from './drag-coordinates.ts';
import WeekCalendarGrid from './WeekCalendarGrid.tsx';
import WeekCalendarHeader from './WeekCalendarHeader.tsx';
import type { MeetDto } from 'entities';

export interface WeekCalendarProps {
  meets: MeetDto[];

  weekStartsOn?: 0 | 1;

  startHour?: number;

  endHour?: number;

  onMeetClick?(meet: MeetDto): void;

  onCellClick?(date: Date): void;
  single?: boolean;
  visibleDays: number[];
  editing?: boolean;
  management?: MeetManagement;
}

export default function WeekCalendar({ meets, visibleDays, single, startHour = 0, endHour = 24, onMeetClick, onCellClick,
  editing = false, management }: WeekCalendarProps) {
  const queryClient = useQueryClient();
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number[]>([]);
  const pending = useRef(new Set<number>());
  const scrollContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollContainer.current) scrollContainer.current.scrollTop = Math.max(0, 8 - startHour) * 72;
  }, [startHour]);
  const [error, setError] = useState<string>();
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: calendarKeyboardCoordinates }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const meet = meets.find(item => item.id === active.id);
    const timestamp: unknown = over?.data.current?.timestamp;
    if (!editing || !meet || !canManageMeet(meet, management) || pending.current.has(meet.id) || typeof timestamp !== 'number') return;
    const { date, time } = moscowInput(timestamp);
    const startedAt = meetStart(date, time);
    if (new Date(meet.startedAt).getTime() === timestamp) return;
    pending.current.add(meet.id);
    setSaving([...pending.current]); setError(undefined);
    setOverrides(current => ({ ...current, [meet.id]: startedAt }));
    try {
      const place = await queryClient.fetchQuery({ queryKey: ['place', meet.place.id], queryFn: () => fetchPlace(meet.place.id) });
      if (!withinPlaceHours(startedAt, meet.duration, place.schedule ?? [])) throw new Error('Весь интервал встречи должен входить в часы работы центра (МСК)');
      await fetchUpdateMeet(meet.id, { startedAt });
      await invalidateMeetQueries(queryClient, meet.projectId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось перенести встречу');
    } finally {
      setOverrides(current => { const next = { ...current }; delete next[meet.id]; return next; });
      pending.current.delete(meet.id); setSaving([...pending.current]);
    }
  };

  return (
    <Stack spacing={1}>
    {error && <Alert severity="error">{error}</Alert>}
    <DndContext sensors={sensors} collisionDetection={slotCollision} onDragEnd={handleDragEnd}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {!single && <WeekCalendarHeader days={visibleDays} />}

        <Box
          ref={scrollContainer}
          sx={{
            flex: 1,
            overflow: 'auto', maxHeight: '70vh',
          }}
        >
          <WeekCalendarGrid
            days={visibleDays}
            meets={meets.map(meet => overrides[meet.id] ? { ...meet, startedAt: overrides[meet.id] } : meet)}
            startHour={startHour}
            endHour={endHour}
            onMeetClick={onMeetClick}
            onCellClick={onCellClick}
            editing={editing} management={management} saving={saving} onError={setError}
          />
        </Box>
      </Paper>
    </DndContext>
    </Stack>
  );
}
