import { useMemo } from 'react';
import { format } from 'date-fns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import type { PlaceScheduleDayDto } from 'types';

interface Props {
  value: string;
  schedule: PlaceScheduleDayDto[];

  onChange: (value: string) => void;
}

export default function MeetDateField({ value, schedule, onChange }: Props) {
  const workingDays = useMemo(() => new Set(schedule.filter(day => day.enabled).map(day => day.weekday)), [schedule]);

  return (
    <DateCalendar
      disablePast
      value={value ? new Date(value) : null}
      onChange={date => {
        if (!date) return;

        onChange(format(date, 'yyyy-MM-dd'));
      }}
      shouldDisableDate={date => {
        // JS: 0 = воскресенье ... 6 = суббота
        const weekday = date.getDay() === 0 ? 7 : date.getDay();

        return !workingDays.has(weekday);
      }}
    />
  );
}
