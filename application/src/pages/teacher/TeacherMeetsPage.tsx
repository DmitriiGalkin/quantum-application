import { useQuery } from '@tanstack/react-query';
import { fetchTeacherMeets } from '../../requests.ts';
import Meets from '../../features/meets/Meets.tsx';

function TeacherMeetsPage() {
  const { data: meets = [], isLoading, refetch } = useQuery({
    queryKey: ['teacher-meets'],
    queryFn: fetchTeacherMeets,
  });

  if (isLoading) {
    return <>Загрузка...</>;
  }

  return <Meets title="Мои встречи" meets={meets} refetch={refetch} />;
}

export default TeacherMeetsPage;
