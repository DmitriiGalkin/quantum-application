import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { PlaceScheduleRow } from './PlaceScheduleRow';
import type { PlaceScheduleDayDto } from 'entities';

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
            <PlaceScheduleRow key={day.weekday} label={WEEKDAYS[day.weekday % 7]} value={day} onChange={updated => handleChange(index, updated)} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
