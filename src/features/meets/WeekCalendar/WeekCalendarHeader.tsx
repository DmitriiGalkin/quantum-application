// components/meet/WeekCalendarHeader.tsx

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { moscowDay, moscowFormat, moscowYear } from '../moscow-time.ts';


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
            bgcolor: moscowDay(new Date()) === day ? 'primary.50' : 'inherit',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'capitalize',
            }}
          >
            {moscowFormat(day, { weekday: 'long' })}
          </Typography>

          <Typography variant="h6">
            {moscowFormat(day, { day: 'numeric' })}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {moscowFormat(day, { month: 'long', year: moscowYear(day) !== moscowYear(new Date()) || moscowYear(days[0]) !== moscowYear(days[days.length - 1]) ? 'numeric' : undefined })}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
