import { useQuery } from '@tanstack/react-query';
import { fetchTeacherMeets } from '../../requests.ts';
import Meets from '../../features/meets/Meets.tsx';
import { useAuth } from '../../providers/auth-context.ts';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function TeacherMeetsPage() {
  const { passport } = useAuth();
  const { data: meets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-meets'],
    queryFn: fetchTeacherMeets,
  });

  if (isLoading) {
    return <Typography role="status">Загрузка встреч преподавателя…</Typography>;
  }
  if (isError) return <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить встречи.</Alert>;

  return <Meets title="Мои встречи" meets={meets} refetch={refetch} management={{ teacherId: passport?.id }} />;
}

export default TeacherMeetsPage;
