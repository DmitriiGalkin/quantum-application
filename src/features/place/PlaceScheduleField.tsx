import { Card, CardContent, CardHeader, Divider, Stack } from '@mui/material';
import { PlaceScheduleRow } from './PlaceScheduleRow';
import type { PlaceScheduleDayDto } from 'types';

type Props = {
  value: PlaceScheduleDayDto[];
  onChange: (value: PlaceScheduleDayDto[]) => void;
};

const WEEKDAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export function PlaceScheduleField({ value, onChange }: Props) {
  const handleChange = (index: number, day: PlaceScheduleDayDto) => {
    const next = [...value];
    next[index] = day;
    onChange(next);
  };

  return (
    <Card variant="outlined">
      <CardHeader title="Рабочие часы" subheader="Когда в центре можно проводить занятия" />

      <Divider />

      <CardContent>
        <Stack spacing={2}>
          {value.map((day, index) => (
            <PlaceScheduleRow key={day.weekday} label={WEEKDAYS[day.weekday]} value={day} onChange={updated => handleChange(index, updated)} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
