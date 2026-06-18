import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Button, Card, CardContent, CardHeader } from '@mui/material';
import type { ProjectFullDto } from '@shared/types';
import { useNavigate } from 'react-router-dom';
import AvatarGroupUsers from './AvatarGroupUsers.tsx';

type IdeaProjectCardProps = {
  project: ProjectFullDto;
  withoutPassport?: boolean;
};

function IdeaProjectCard({ project, withoutPassport }: IdeaProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader avatar={<Avatar>R</Avatar>} title="Дмитрий Галкин" subheader="22" />
      <CardContent>
        <AvatarGroupUsers users={project.users || []} />
        <Typography variant="body2" color="text.secondary">
          {project?.place?.title || 'Без названия'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {project?.place?.address}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mt: 1 }}>
          {project.meets?.map(meet => (
            <Box
              key={meet.id}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: 'grey.100',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography variant="caption">{new Date(meet.startedAt).toLocaleDateString('ru-RU')}</Typography>
              <Typography variant="caption">
                {new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* CTA */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" size="small" onClick={() => navigate(`/project/${project.id}`)}>
            Перейти в проект
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default IdeaProjectCard;
