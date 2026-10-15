import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { PlaceScheduleDayDto } from 'entities';

type Props = {
  label: string;
  value: PlaceScheduleDayDto;
  onChange: (value: PlaceScheduleDayDto) => void;
};

export function PlaceScheduleRow({ label, value, onChange }: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
      <FormControlLabel
        sx={{ width: { xs: 'auto', sm: 170 }, flexShrink: 0 }}
        control={
          <Checkbox
            checked={value.enabled}
            onChange={e =>
              onChange({
                ...value,
                enabled: e.target.checked,
              })
            }
          />
        }
        label={label}
      />

      {value.enabled ? (
        <>
          <TextField
            label="Начало"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { 'aria-label': `${label}: начало работы` } }}
            sx={{ minWidth: 0, flex: 1 }}
            size="small"
            type="time"
            value={value.startTime}
            onChange={e =>
              onChange({
                ...value,
                startTime: e.target.value,
              })
            }
          />

          <Typography aria-hidden sx={{ display: { xs: 'none', sm: 'block' } }}>—</Typography>

          <TextField
            label="Окончание"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { 'aria-label': `${label}: окончание работы` } }}
            sx={{ minWidth: 0, flex: 1 }}
            size="small"
            type="time"
            value={value.endTime}
            onChange={e =>
              onChange({
                ...value,
                endTime: e.target.value,
              })
            }
          />
        </>
      ) : (
        <Typography color="text.secondary">Выходной</Typography>
      )}
    </Stack>
  );
}
