import { Avatar, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

type Teacher = {
  id: number;
  title: string;
  image?: string;
  projectCount?: number;
};

export default function PlaceTeachersPage() {
  // TODO заменить на useQuery
  const teachers: Teacher[] = [
    {
      id: 1,
      title: 'Анна Иванова',
      projectCount: 4,
    },
    {
      id: 2,
      title: 'Дмитрий Петров',
      projectCount: 2,
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Учителя центра</Typography>

      <Button variant="contained" component={Link} to="/place/invite-teacher">
        Пригласить учителя
      </Button>

      {teachers.length === 0 && <Typography color="text.secondary">Учителей пока нет</Typography>}

      {teachers.map(teacher => (
        <Card key={teacher.id}>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar src={teacher.image} alt={teacher.title} sx={{ width: 56, height: 56 }} />

              <Stack spacing={0.5}>
                <Typography>{teacher.title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  Проектов: {teacher.projectCount ?? 0}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
