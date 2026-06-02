import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from "@mui/material/CardMedia";
import type {ExtendedProject} from "../requests.ts";
import SchoolIcon from '@mui/icons-material/School';
import Stack from "@mui/material/Stack";
import UserGroup from "./UserGroup.tsx";


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
      {/* Родительский контейнер для позиционирования иконки */}
        <CardMedia
            component="img"
            height="90"
            image={project.image || `/bg.jpeg`}
            alt={project.title || 'Идея'}
            sx={{ objectFit: 'cover' }}
        />

      <CardContent sx={{ flexGrow: 1 }}>

        <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>
          {project.title}
        </Typography>

        <Typography color="text.secondary" gutterBottom>{project.description}</Typography>

             <UserGroup users={project.users} />


          <Stack direction="row" spacing={1.25} sx={{ minWidth: 140, alignItems: 'center', justifyContent: 'flex-end' }}>

              <Typography>
                  {project?.passport?.title}
              </Typography><SchoolIcon />
          </Stack>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
