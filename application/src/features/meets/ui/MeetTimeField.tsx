import { MenuItem, TextField } from '@mui/material';
import { useMemo } from 'react';
import type { PlaceScheduleDayDto } from '@shared/types';

interface MeetTimeFieldProps {
  date: string;
  duration: number;

  schedule: PlaceScheduleDayDto[];

  value: string;
  onChange: (value: string) => void;
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getWeekday(date: string) {
  const day = new Date(date).getDay();

  // JS:
  // 0 воскресенье
  // 1 понедельник
  // ...

  return day === 0 ? 7 : day;
}

function buildSlots(schedule: PlaceScheduleDayDto[], date: string, duration: number, step = 15) {
  const weekday = getWeekday(date);

  const intervals = schedule.filter(interval => interval.weekday === weekday);

  const slots: string[] = [];

  for (const interval of intervals) {
    const start = timeToMinutes(interval.startTime);
    const end = timeToMinutes(interval.endTime);

    for (let current = start; current + duration <= end; current += step) {
      slots.push(minutesToTime(current));
    }
  }

  return slots;
}

export default function MeetTimeField({ date, duration, schedule, value, onChange }: MeetTimeFieldProps) {
  const slots = useMemo(() => buildSlots(schedule, date, duration), [schedule, date, duration]);

  return (
    <TextField
      select
      label="Время"
      value={value}
      onChange={e => onChange(e.target.value)}
      fullWidth
      disabled={slots.length === 0}
      helperText={slots.length === 0 ? 'На выбранную дату нет свободного времени' : undefined}
    >
      {slots.map(time => (
        <MenuItem key={time} value={time}>
          {time}
        </MenuItem>
      ))}
    </TextField>
  );
}
