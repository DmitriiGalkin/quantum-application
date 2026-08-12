import { useQuery } from '@tanstack/react-query';
import { fetchPlaceMeets } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Meets from '../../features/meets/Meets.tsx';

export default function PlaceMeetsPage() {
  const { activeContext } = useAuth();

  const { data: meets, refetch } = useQuery({
    queryKey: ['meets', activeContext?.placeId],
    queryFn: fetchPlaceMeets,
  });

  if (!meets)return null;

  return <Meets title="Расписание центра" meets={meets} refetch={refetch}/>;
}
