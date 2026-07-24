import { MenuItem, TextField } from '@mui/material';
import { addDays, formatDate } from '../../../utils/time.ts';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MeetDateField({ value, onChange }: Props) {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), i);

    return {
      value: formatDate(d),
      label: d.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
      }),
    };
  });

  return (
    <TextField select label="Дата" value={value} onChange={e => onChange(e.target.value)} fullWidth>
      {dates.map(date => (
        <MenuItem key={date.value} value={date.value}>
          {date.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
