import { CardContent, Stack, Typography } from "@mui/material";
import Card from '@mui/material/Card';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherIdeas } from '../../requests.ts';

export default function TeacherIdeasPage() {
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['teacher-ideas'],
    queryFn: fetchTeacherIdeas,
  });

  if (isLoading) {
    return <>Загрузка...</>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Идеи учеников</Typography>

      {ideas.map(idea => (
        <Card key={idea.id}>
          <CardContent>
            <Typography>{idea.title}</Typography>

            <Typography color="text.secondary">
              {idea.user.title} · {idea.createdAt}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
