import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchMeets } from '../../requests.ts';
import MeetingCardContainer, { toMeeting } from '../../features/meets/ui/MeetingCard/MeetingCardContainer.tsx';

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
        <MeetingCardContainer key={meet.id} meeting={toMeeting(meet)} role="place" onOpen={()=>console.log('open')} />
      ))}
    </Stack>
  );
}
