import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import UserGroup from './UserGroup.tsx';
import Box from "@mui/material/Box";
import type { ProjectDto } from '@shared/types';

type ProjectCardProps = {
  project: ProjectDto;
  withoutPassport?: boolean;
};

function ProjectCard({ project, withoutPassport }: ProjectCardProps) {
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

        //backdropFilter: 'blur(10px)', // опционально (glass effect)
      }}
      onClick={() => project.id && (window.location.href = `/project/${project.id}`)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="column" sx={{ justifyContent: 'space-between' }}>
            {/* Аватарки учеников */}
            <UserGroup users={project.users || []} />

            {/* Информация о кураторе */}
            {!withoutPassport && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.primary">
                  Куратор:
                </Typography>
                <Typography variant="body1">{project?.passport?.title}</Typography>
              </Box>
            )}

            <Box>
              <Typography variant="body2" color="text.secondary">
                {project?.place?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project?.place?.address}
              </Typography>
            </Box>
          </Stack>
          {project.meets && (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1 }}>
              {project.meets.map(meet => (
                <Box
                  key={meet.id}
                  sx={{
                    minWidth: 140,
                    p: 2,
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography>{new Date(meet.startedAt).toLocaleDateString('ru-RU')}</Typography>

                  <Typography variant="caption" color="text.secondary">
                    {new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>

                  <Typography variant="caption">{meet.price ? `${meet.price} ₽` : 'Free'}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;

//Если хочешь — могу сделать тебе как в Airbnb / календарь бронирований (очень крутой UI для встреч).