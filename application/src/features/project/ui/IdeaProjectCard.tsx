import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Card, CardActionArea, Stack } from '@mui/material';
import { type ProjectExtendedDto } from '@shared/types';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProjectUser, fetchCreateUser, fetchDeleteProjectUser } from '../../../requests.ts';
import ProjectCardHeader from './ProjectCardHeader.tsx';
import Meet from '../../meets/ui/Meet.tsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { CreateUserForm } from '../../user/ui/CreateUserForm.tsx';
import { usePostAuthAction } from '../../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../../shared/lib/useRunPostAuthAction.ts';

type IdeaProjectCardProps = {
  project: ProjectExtendedDto; // частичное должно быть
  refetch?: any;
};

const CREATE_PROJECT_USER_TYPE = 'create-project-user';

function IdeaProjectCard({ project, refetch }: IdeaProjectCardProps) {
  const { user, passport, authHandler, refetch: refetchPassport } = useAuth();
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const [isUserModalOpen, setUserModalOpen] = useState(false);

  const liked = user && project.users?.map(user => user.id).includes(user.id);

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

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteProjectUser,
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

  const handleLike = () => {
    if (!user) {
      setAction({
        type: CREATE_PROJECT_USER_TYPE,
        payload: { projectId: project.id },
      });

      return authHandler();
    }

    mutationLike.mutate({ userId: user.id, projectId: project.id });
  };

  const handleUnlike = () => {
    if (user) mutationUnlike.mutate({ userId: user.id, projectId: project.id });
    else authHandler();
  };

  const handleUserCreate = (title: string) => {
    setUserModalOpen(false);

    createUser.mutate(
      { title },
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
      <CardActionArea onClick={() => navigate(`/project/${project.id}`)}>
        <ProjectCardHeader passport={project.passport} place={project.place} handleUnlike={liked && handleUnlike} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowX: 'auto' }}>
          {project.meets?.[0] && <Meet meet={project.meets[0]} withoutAction={!liked} refetch={refetch} withoutUsers />}
        </Box>

        {Boolean(project.users.length) && (
          <Box sx={{ p: 2 }}>
            <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Участники проекта
            </Typography>
            <AvatarGroupUsers users={project.users || []} />
          </Box>
        )}
      </CardActionArea>

      {!liked && (
        <Stack spacing={2} direction="row" sx={{ alignItems: 'center', px: 2, pb: 2 }}>
          <Button variant="contained" size="small" onClick={handleLike}>
            Присоединиться к проекту
          </Button>
          {!project.users.length && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Станьте первым участником и помогите запустить проект 🚀
            </Typography>
          )}
        </Stack>
      )}

      <Dialog open={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
        <DialogTitle>Создать ребенка</DialogTitle>
        <DialogContent>
          <CreateUserForm onSubmit={data => handleUserCreate(data.title)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default IdeaProjectCard;
