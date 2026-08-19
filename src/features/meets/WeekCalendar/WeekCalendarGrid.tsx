// components/meet/WeekCalendarGrid.tsx

import { Box, Typography } from '@mui/material';
import { isSameDay } from 'date-fns';

import WeekCalendarMeet from './WeekCalendarMeet.tsx';
import type { MeetExtendedDto } from 'types';

const HOUR_HEIGHT = 72;

interface Props {
  days: number[];
  meets: MeetExtendedDto[];

  startHour: number;
  endHour: number;

  onMeetClick?(meet: MeetExtendedDto): void;
  onCellClick?(date: Date): void;
}

export default function WeekCalendarGrid({ days, meets, startHour, endHour, onMeetClick, onCellClick }: Props) {

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
        position: 'relative',
      }}
    >
      {/* колонка времени */}
      <Box
        sx={{
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        {hours.map(hour => (
          <Box
            key={hour}
            sx={{
              height: HOUR_HEIGHT,
              borderBottom: 1,
              borderColor: 'divider',
              px: 1,
              //pt: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {`${hour.toString().padStart(2, '0')}:00`}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* дни */}
      {days.map(day => (
        <Box
          key={day}
          sx={{
            position: 'relative',
            borderRight: 1,
            borderColor: 'divider',
            height: HOUR_HEIGHT * hours.length,
          }}
        >
          {/* сетка */}
          {hours.map(hour => {
            const date = new Date(day);

            date.setHours(hour, 0, 0, 0);

            return (
              <Box
                key={hour}
                onClick={() => onCellClick?.(date)}
                sx={{
                  height: HOUR_HEIGHT,
                  borderBottom: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',

                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              />
            );
          })}

          {/* встречи */}
          {meets
            .filter(meet => isSameDay(new Date(meet.startedAt), day))
            .map(meet => {
              const started = new Date(meet.startedAt);

              const top = ((started.getHours() - startHour) * 60 + started.getMinutes()) * (HOUR_HEIGHT / 60);

              const height = Number(meet.duration) * (HOUR_HEIGHT / 60);

              return <WeekCalendarMeet key={meet.id} meet={meet} top={top} height={height} onClick={() => onMeetClick?.(meet)} />;
            })}
        </Box>
      ))}
    </Box>
  );
}
