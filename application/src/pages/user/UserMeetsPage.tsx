import { useQuery } from '@tanstack/react-query';
import { fetchMeets } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Meets from '../../features/meets/Meets.tsx';

export default function UserMeetsPage() {
  const { activeContext} = useAuth();
  const { data: meets, refetch } = useQuery({
    queryKey: ['meets', activeContext?.userId],
    queryFn: fetchMeets,
  });

  if (!meets) return null;

  return <Meets title="Мои встречи" meets={meets} refetch={refetch} />;
}
