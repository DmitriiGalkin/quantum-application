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
    <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
      <FormControlLabel
        sx={{ width: 170, flexShrink: 0 }}
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
            size="small"
            type="time"
            value={value.startTime}
            onChange={e =>
              onChange({
                ...value,
                startTime: e.target.value,
              })
            }
            //InputLabelProps={{ shrink: true }}
            //inputProps={{ step: 300 }}
          />

          <Typography>—</Typography>

          <TextField
            size="small"
            type="time"
            value={value.endTime}
            onChange={e =>
              onChange({
                ...value,
                endTime: e.target.value,
              })
            }
            //InputLabelProps={{ shrink: true }}
            //inputProps={{ step: 300 }}
          />
        </>
      ) : (
        <Typography color="text.secondary">Выходной</Typography>
      )}
    </Stack>
  );
}
