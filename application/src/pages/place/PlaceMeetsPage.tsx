import { useQuery } from '@tanstack/react-query';
import { fetchPlaceMeets } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Meets from '../../features/meets/Meets.tsx';


//
// Для центра это одна из самых полезных страниц, поэтому позже сюда хорошо ложатся:
//
//   фильтр по учителю
// фильтр по проекту
// календарный вид
// количество участников
// отметка "встреча завершена"

export default function PlaceMeetsPage() {
  const { activePlace } = useAuth();
  const id = activePlace?.id;
  const placeId = Number(id);

  const { data: meets, refetch } = useQuery({
    queryKey: ['meets', placeId],
    queryFn: () => fetchPlaceMeets(),
    enabled: !!placeId,
  });

  if (!meets)return null;

  return <Meets title="Расписание центра" meets={meets} refetch={refetch}/>;
}
