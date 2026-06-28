import { useQuery } from '@tanstack/react-query';
import { fetchTeacherMeets } from '../../requests.ts';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import MeetingCardContainer from '../../features/meets/ui/MeetingCard/MeetingCardContainer.tsx';

function TeacherMeetsPage() {
  const { data: meets = [], isLoading } = useQuery({
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
        <MeetingCardContainer
          key={meet.id}
          meet={meet}
        />
      ))}
    </Stack>
  );
}

export default TeacherMeetsPage;
