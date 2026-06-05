import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { ExtendedProject } from '../requests.ts';
import Stack from '@mui/material/Stack';
import UserGroup from './UserGroup.tsx';
import Box from "@mui/material/Box";

type ProjectCardProps = {
  project: ExtendedProject;
};

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        cursor: project.id ? 'pointer' : 'default', // Убираем курсор, если ссылки нет
      }}
      onClick={() => project.id && (window.location.href = `/project/${project.id}`)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom noWrap>
          {project.title}
        </Typography>
        <Typography
          color="text.secondary"
          gutterBottom
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
          }}
        >
          {project.description}
        </Typography>

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Аватарки учеников */}
          <UserGroup users={project.users || []} />

          {/* Информация о кураторе */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.primary">
              Куратор:
            </Typography>
            <Typography variant="body1">{project?.passport?.title}</Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {project?.place?.title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
