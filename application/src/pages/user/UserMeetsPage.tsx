import { useQuery } from '@tanstack/react-query';
import { fetchMeets } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Meets from '../../features/meets/Meets.tsx';

export default function UserMeetsPage() {
  const { activeUser } = useAuth();
  const { data: meets, refetch } = useQuery({
    queryKey: ['meets', activeUser?.id],
    queryFn: () => fetchMeets({ userId: activeUser?.id || 0 }),
    enabled: !!activeUser?.id,
  });

  if (!meets) return null;

  return <Meets title="Мои встречи" meets={meets} refetch={refetch} />;
}
