// components/meet/WeekCalendar.tsx

import { Box, Paper } from '@mui/material';
import { addDays, startOfWeek } from 'date-fns';
import { useMemo } from 'react';

import WeekCalendarGrid from './WeekCalendarGrid';
import WeekCalendarHeader from './WeekCalendarHeader';
import type { Meet } from './types';

export interface WeekCalendarProps {
  meets: Meet[];

  weekStartsOn?: 0 | 1;

  startHour?: number;

  endHour?: number;

  onMeetClick?(meet: Meet): void;

  onCellClick?(date: Date): void;
}

export default function WeekCalendar({ meets, weekStartsOn = 1, startHour = 8, endHour = 22, onMeetClick, onCellClick }: WeekCalendarProps) {
  const weekStart = useMemo(
    () =>
      startOfWeek(new Date(), {
        weekStartsOn,
      }),
    [weekStartsOn],
  );

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  return (
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
      <WeekCalendarHeader days={days} />

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <WeekCalendarGrid days={days} meets={meets} startHour={startHour} endHour={endHour} onMeetClick={onMeetClick} onCellClick={onCellClick} />
      </Box>
    </Paper>
  );
}
