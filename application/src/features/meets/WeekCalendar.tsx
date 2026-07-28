import {
  Box,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { addDays, format, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import { ru } from 'date-fns/locale';
import WeekCalendarGrid from './WeekCalendarGrid.tsx';
import WeekCalendarHeader from './WeekCalendarHeader.tsx';
import type { MeetExtendedDto } from '@shared/types';

export interface WeekCalendarProps {
  meets: MeetExtendedDto[];

  weekStartsOn?: 0 | 1;

  startHour?: number;

  endHour?: number;

  onMeetClick?(meet: MeetExtendedDto): void;

  onCellClick?(date: Date): void;
}

export default function WeekCalendar({ meets, weekStartsOn = 1, startHour = 8, endHour = 22, onMeetClick, onCellClick }: WeekCalendarProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedDay, setSelectedDay] = useState(0);

  const weekStart = useMemo(
    () =>
      startOfWeek(new Date(), {
        weekStartsOn,
      }),
    [weekStartsOn],
  );

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  const visibleDays = mobile ? [days[selectedDay]] : days;

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
      {mobile ? (
        <ToggleButtonGroup
          exclusive
          value={selectedDay}
          onChange={(_, value) => {
            if (value !== null) {
              setSelectedDay(value);
            }
          }}
          sx={{
            p: 0.5,
            overflowX: 'auto',
            flexWrap: 'nowrap',

            '& .MuiToggleButtonGroup-grouped': {
              borderRadius: 2,
              mx: 0.25,
              border: 1,
              borderColor: 'divider',
              minWidth: 60,
              flexShrink: 0,
            },

            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          {days.map((day, index) => (
            <ToggleButton key={index} value={index}>
              <Stack spacing={0.25} sx={{ alignItems: 'center'}}>
                <Typography variant="caption">{format(day, 'EE', { locale: ru })}</Typography>

                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {format(day, 'd')}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      ) : (
        <WeekCalendarHeader days={days} />
      )}

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <WeekCalendarGrid
          days={visibleDays}
          meets={meets}
          startHour={startHour}
          endHour={endHour}
          onMeetClick={onMeetClick}
          onCellClick={onCellClick}
        />
      </Box>
    </Paper>
  );
}
