import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Button, Card, CardContent, CardHeader, Stack } from '@mui/material';
import type { ProjectFullDto } from '@shared/types';
import { useNavigate } from 'react-router-dom';
import AvatarGroupUsers from './AvatarGroupUsers.tsx';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';

type IdeaProjectCardProps = {
  project: ProjectFullDto;
  withoutPassport?: boolean;
};

function IdeaProjectCard({ project, withoutPassport }: IdeaProjectCardProps) {
  const navigate = useNavigate();




  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<Avatar src={project.passport.image}>{project.passport.title[0]}</Avatar>}
        title={project.passport.title}
        subheader="Профессор всех наук и просто боксер"
      />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowX: 'auto' }}>
          {!project.meets?.length && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Встреч пока нет
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Станьте первым участником и помогите запустить проект 🚀
              </Typography>
            </Box>
          )}

          {project.meets?.slice(0, 2).map((meet, index) => {
            const isNext = index === 0;
            const from = new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const to = new Date(new Date(meet.startedAt).getTime() + meet.duration * 60 * 1000).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Stack
                direction="row"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: isNext ? 'rgba(255,182,40,0.15)' : 'transparent',
                }}
              >
                {/* DATE BLOCK */}
                <Box
                  sx={{
                    width: 44,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,182,40,0.2)',
                    color: '#111',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 1.5,
                  }}
                >
                  <Typography variant="caption">
                    {new Date(meet.startedAt)
                      .toLocaleDateString('ru-RU', {
                        month: 'short',
                      })
                      .toUpperCase()
                      .replace('.', '')}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {new Date(meet.startedAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>

                {/* CONTENT */}
                <Box>
                  <Typography variant="h6">Ближайшая встреча</Typography>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                    <Typography variant="body2" color="text.secondary">
                      {from} – {to}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PlaceIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                    <Typography variant="body2" color="text.secondary">
                      {project?.place?.address}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            );
          })}
        </Box>

        <Stack sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Участники
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <AvatarGroupUsers users={project.users || []} />

            <Stack direction="row" spacing={1}>
              <Button variant="text" size="small">
                Подробнее
              </Button>
              <Button variant="contained" size="small">
                Вступить
              </Button>
            </Stack>
          </Box>
        </Stack>

        {/* CTA */}
      </CardContent>
    </Card>
  );
}

export default IdeaProjectCard;
