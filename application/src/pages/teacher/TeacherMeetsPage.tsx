import { useQuery } from '@tanstack/react-query';
import { fetchTeacherMeets } from '../../requests.ts';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import MeetCard from '../../features/meets/MeetCard.tsx';

function TeacherMeetsPage() {
  const { data: meets = [], isLoading, refetch } = useQuery({
    queryKey: ['teacher-meets'],
    queryFn: fetchTeacherMeets,
  });

  if (isLoading) {
    return <>Загрузка...</>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Встречи</Typography>

      {meets.map(meet => (
        <MeetCard key={meet.id} meet={meet} refetch={refetch} />
      ))}
    </Stack>
  );
}

export default TeacherMeetsPage;
