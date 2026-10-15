import { useMemo } from 'react';
import { format } from 'date-fns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

import type { PlaceScheduleDayDto } from 'entities';
import { moscowInput } from '../../shared/lib/meet-time.ts';

interface Props {
  value: string;
  schedule: PlaceScheduleDayDto[];

  onChange: (value: string) => void;
}

export default function MeetDateField({ value, schedule, onChange }: Props) {
  const workingDays = useMemo(() => new Set(schedule.filter(day => day.enabled).map(day => day.weekday)), [schedule]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <DateCalendar
        sx={{
          width: '100%', maxWidth: 320, minWidth: 0,
          '& .MuiPickersCalendarHeader-root': { mx: 0, px: 0 },
          '& .MuiPickersCalendarHeader-labelContainer': { minWidth: 0, mr: 0 },
          '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': { justifyContent: 'space-between' },
          '& .MuiDayCalendar-weekDayLabel': { width: 'calc(100% / 7)', mx: 0 },
          '& .MuiPickerDay-root': { flex: '1 1 0', minWidth: 0, maxWidth: 36, height: 'auto', aspectRatio: '1', mx: 0 },
        }}
        referenceDate={new Date(`${moscowInput(new Date()).date}T12:00:00`)}
        value={value ? new Date(`${value}T00:00:00`) : null}
        onChange={date => {
          if (!date) return;

          onChange(format(date, 'yyyy-MM-dd'));
        }}
        shouldDisableDate={date => {
          // JS: 0 = воскресенье ... 6 = суббота
          const weekday = date.getDay() === 0 ? 7 : date.getDay();

          return format(date, 'yyyy-MM-dd') < moscowInput(new Date()).date || !workingDays.has(weekday);
        }}
      />
    </LocalizationProvider>
  );
}
