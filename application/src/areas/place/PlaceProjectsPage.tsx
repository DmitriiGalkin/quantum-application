import { Card, CardContent, Stack, Typography } from '@mui/material';

type Project = {
  id: number;
  title: string;
  teacherTitle: string;
  userCount: number;
};

export default function PlaceProjectsPage() {
  // TODO: заменить на useQuery(fetchPlaceProjects)
  const projects: Project[] = [
    {
      id: 1,
      title: 'Робототехника',
      teacherTitle: 'Анна Иванова',
      userCount: 8,
    },
    {
      id: 2,
      title: 'Создание сайта',
      teacherTitle: 'Дмитрий Петров',
      userCount: 5,
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Проекты центра
      </Typography>

      {projects.length === 0 && <Typography color="text.secondary">В центре пока нет проектов</Typography>}

      {projects.map(project => (
        <Card key={project.id}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">{project.title}</Typography>

              <Typography variant="body2" color="text.secondary">
                Учитель: {project.teacherTitle}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Участников: {project.userCount}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
