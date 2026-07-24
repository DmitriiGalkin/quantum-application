import { MenuItem, TextField } from '@mui/material';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function MeetTimeField({ value, onChange }: Props) {
  return (
    <TextField select label="Время" value={value} onChange={e => onChange(e.target.value)} fullWidth>
      {TIMES.map(time => (
        <MenuItem key={time} value={time}>
          {time}
        </MenuItem>
      ))}
    </TextField>
  );
}
