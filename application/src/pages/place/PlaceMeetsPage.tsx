import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchMeets } from '../../requests.ts';
import MeetCard from '../../features/meets/ui/MeetCard/MeetCard.tsx';
import WeekCalendar from '../../features/meets/ui/WeekCalendar.tsx';

//
// Для центра это одна из самых полезных страниц, поэтому позже сюда хорошо ложатся:
//
//   фильтр по учителю
// фильтр по проекту
// календарный вид
// количество участников
// отметка "встреча завершена"

export default function PlaceMeetsPage() {
const place = {id: 2}

  const { data: meets } = useQuery({
    queryKey: ['meets', place?.id],
    queryFn: () => fetchMeets({ placeId: place?.id || 0 }),
    enabled: !!place?.id,
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Расписание центра</Typography>

      {meets?.length === 0 && <Typography color="text.secondary">Запланированных встреч нет</Typography>}

      {meets?.map(meet => (
        <MeetCard key={meet.id} meet={meet} />
      ))}

      <WeekCalendar
        meets={[
          {
            id: 1,
            title: 'Алгебра',
            startedAt: '2026-07-06T09:00:00',
            endedAt: '2026-07-06T10:30:00',
            color: '#1976d2',
            project: {
              id: 1,
              name: '9А класс',
            },
          },
          {
            id: 2,
            title: 'Физика',
            startedAt: '2026-07-08T14:00:00',
            endedAt: '2026-07-08T15:30:00',
            color: '#2e7d32',
            project: {
              id: 2,
              name: 'Подготовка к ЕГЭ',
            },
          },
          {
            id: 3,
            title: 'Химия',
            startedAt: '2026-07-09T11:00:00',
            endedAt: '2026-07-09T12:00:00',
            color: '#ed6c02',
            project: {
              id: 3,
              name: '10 класс',
            },
          },
        ]}
        onMeetClick={meet => {
          console.log('Встреча', meet);
          // navigate(`/meet/${meet.id}`);
        }}
        onCellClick={date => {
          console.log('Создать встречу', date);
          // navigate(`/meet/create?startedAt=${date.toISOString()}`);
        }}
      />
    </Stack>
  );
}
