// components/meet/WeekCalendarHeader.tsx

import { Box, Typography } from '@mui/material';
import { format, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props {
  days: number[];
}

export default function WeekCalendarHeader({ days }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '72px repeat(7, 1fr)',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          borderRight: 1,
          borderColor: 'divider',
        }}
      />

      {days.map(day => (
        <Box
          key={day}
          sx={{
            py: 1.5,
            px: 1,
            textAlign: 'center',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: isToday(day) ? 'primary.50' : 'inherit',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'capitalize',
            }}
          >
            {format(day, 'EEEE', {
              locale: ru,
            })}
          </Typography>

          <Typography variant="h6">
            {format(day, 'd')}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {format(day, 'MMMM', {
              locale: ru,
            })}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
