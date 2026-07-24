import { Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';

export type PlaceScheduleDayValue = {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type Props = {
  label: string;
  value: PlaceScheduleDayValue;
  onChange: (value: PlaceScheduleDayValue) => void;
};

export function PlaceScheduleDayField({ label, value, onChange }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <FormControlLabel
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
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center'}}>
            <TextField
              label="С"
              type="time"
              size="small"
              value={value.startTime}
              onChange={e =>
                onChange({
                  ...value,
                  startTime: e.target.value,
                })
              }
              // InputLabelProps={{
              //   shrink: true,
              // }}
              // inputProps={{
              //   step: 300, // 5 минут
              // }}
            />

            <Typography>—</Typography>

            <TextField
              label="До"
              type="time"
              size="small"
              value={value.endTime}
              onChange={e =>
                onChange({
                  ...value,
                  endTime: e.target.value,
                })
              }
              // InputLabelProps={{
              //   shrink: true,
              // }}
              // inputProps={{
              //   step: 300,
              // }}
            />
          </Stack>
        ) : (
          <Typography color="text.secondary">Выходной</Typography>
        )}
      </Stack>
    </Paper>
  );
}
