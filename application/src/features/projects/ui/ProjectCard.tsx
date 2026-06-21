import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';
import Box from '@mui/material/Box';
import type { ProjectFullDto } from '@shared/types';
import { CardActionArea } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import ProjectCardHeader from './ProjectCardHeader.tsx';
import { useNavigate } from 'react-router-dom';
import ProjectMeetCard from './ProjectMeetCard.tsx';

type ProjectCardProps = {
  project: ProjectFullDto;
};

function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        borderColor: 'divider',
        overflow: 'hidden',
        cursor: project.id ? 'pointer' : 'default', // Убираем курсор, если ссылки нет
      }}
    >
      <ProjectCardHeader passport={project.passport} />
      <CardActionArea onClick={() => navigate(`/project/${project.id}`)}>
        <CardMedia
          component="img"
          height="360"
          image={project.idea.image || `/bg.jpeg`}
          alt={project.idea.title || 'Проект'}
          sx={{
            objectFit: 'cover',
            height: {
              xs: 220,
              sm: 360,
            },
          }}
        />
      </CardActionArea>
      {project.meets?.[0] && (
        <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)' }}>
          <Typography variant="caption" color="text.secondary">
            Ближайшая встреча
          </Typography>
          <ProjectMeetCard meet={project.meets[0]} />
        </Box>
      )}
    </Card>
  );
}

export default ProjectCard;
