import { Card, CardContent, Stack, Typography } from '@mui/material';

type Meet = {
  id: number;
  startedAt: string;
  projectTitle: string;
  teacherTitle: string;
};
//
// Для центра это одна из самых полезных страниц, поэтому позже сюда хорошо ложатся:
//
//   фильтр по учителю
// фильтр по проекту
// календарный вид
// количество участников
// отметка "встреча завершена"

export default function PlaceMeetsPage() {
  // TODO: заменить на useQuery(fetchPlaceMeets)
  const meets: Meet[] = [
    {
      id: 1,
      startedAt: '2026-06-25T16:00:00',
      projectTitle: 'Робототехника',
      teacherTitle: 'Анна Иванова',
    },
    {
      id: 2,
      startedAt: '2026-06-25T18:00:00',
      projectTitle: 'Создание сайта',
      teacherTitle: 'Дмитрий Петров',
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Расписание центра
      </Typography>

      {meets.length === 0 && <Typography color="text.secondary">Запланированных встреч нет</Typography>}

      {meets.map(meet => (
        <Card key={meet.id}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">{meet.projectTitle}</Typography>

              <Typography color="text.secondary">{new Date(meet.startedAt).toLocaleString('ru-RU')}</Typography>

              <Typography variant="body2">Учитель: {meet.teacherTitle}</Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
