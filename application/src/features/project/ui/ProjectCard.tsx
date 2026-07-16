import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Card, CardActionArea, CardContent, Chip, Stack } from '@mui/material';
import { type ProjectExtendedDto } from '@shared/types';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProjectUser, fetchCreateUser } from '../../../requests.ts';
import ProjectCardHeader from './ProjectCardHeader.tsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { CreateUserForm } from '../../user/ui/CreateUserForm.tsx';
import { usePostAuthAction } from '../../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../../shared/lib/useRunPostAuthAction.ts';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { getMeetStatus, statusConfig } from '../../meets/ui/MeetCard/helper.ts';

const CREATE_PROJECT_USER_TYPE = 'create-project-user';

type Props = {
  project: ProjectExtendedDto;
  refetch?: any;
};

function ProjectCard({ project, refetch }: Props) {
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const { activeUser, passport, authHandler, refetch: refetchPassport, activeContext } = useAuth();
  const [isUserModalOpen, setUserModalOpen] = useState(false);

  const isMember = activeUser && project.users?.map(user => user.id).includes(activeUser.id);
  const firstMeet = project.meets?.[0];
  const status = firstMeet ? statusConfig[getMeetStatus(firstMeet)] : undefined;
  const startedAt = new Date(firstMeet?.startedAt);
  const date = startedAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });

  const time = startedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  useRunPostAuthAction(passport, action => {
    if (action.type === CREATE_PROJECT_USER_TYPE && action.payload.projectId === project.id) {
      setUserModalOpen(true);
    }
  });

  const mutationLike = useMutation({
    mutationFn: fetchCreateProjectUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const createUser = useMutation({
    mutationFn: fetchCreateUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const onJoin = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!activeUser) {
      setAction({
        type: CREATE_PROJECT_USER_TYPE,
        payload: { projectId: project.id },
      });

      return authHandler();
    }

    mutationLike.mutate({ userId: activeUser.id, projectId: project.id });
  };

  const handleUserCreate = (title: string) => {
    setUserModalOpen(false);

    createUser.mutate(
      { title, description: 'none' },
      {
        onSuccess: userId => {
          mutationLike.mutate(
            { userId, projectId: project.id },
            {
              onSuccess: () => {
                refetch?.();
                refetchPassport();
              },
            },
          );
        },
      },
    );
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardActionArea
        sx={{
          '&:hover': {
            bgcolor: 'rgba(255,160,40,.05)',
          },
        }}
        onClick={() => navigate(`/project/${project.id}`)}
      >
        <ProjectCardHeader passport={project.passport} place={project.place} />

        {firstMeet && status ? (
          <CardContent sx={{ backgroundColor: 'rgba(255,160,40,.1)' }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Chip label={status.label} color={status.color} size="small" />

              <Typography variant="body2" color="text.secondary">
                {date} • {time}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <ScheduleOutlinedIcon fontSize="small" color="disabled" />
                <Typography variant="body2">{firstMeet.duration}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        ) : (
          <>
            {activeContext.role === 'teacher' && project.passport.id === passport?.id ? (
              <CardContent sx={{ height: 24, backgroundColor: 'rgba(0,0,0,.1)', alignItems: 'center' }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Встреч пока нет
                  </Typography>
                  <Button size="small" variant="contained">
                    Создать встречу
                  </Button>
                </Stack>
              </CardContent>
            ) : (
              <CardContent
                sx={{
                  height: 24,
                  bgcolor: 'rgba(0,0,0,.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Ближайшая встреча не назначена
                </Typography>
              </CardContent>
            )}
          </>
        )}

        <CardContent>
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', height: 48 }}>
            {Boolean(project.users.length) && (
              <Box>
                <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Участники проекта
                </Typography>
                <AvatarGroupUsers users={project.users || []} />
              </Box>
            )}

            {activeContext.role === 'user' && !project.users.length && !isMember && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Станьте первым участником и помогите запустить проект
              </Typography>
            )}

            {activeContext.role === 'user' && !isMember && (
              <Button
                variant="contained"
                size="small"
                onClick={onJoin}
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                Вступить
              </Button>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>

      <Dialog open={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
        <DialogTitle>Создать ребенка</DialogTitle>
        <DialogContent>
          <CreateUserForm onSubmit={data => handleUserCreate(data.title)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ProjectCard;
