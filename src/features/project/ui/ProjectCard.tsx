import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import type { ProjectDto } from 'entities';
import AvatarGroupUsers from 'components/AvatarGroupUsers.tsx';
import { useAuth } from '../../../providers/auth-context.ts';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateProjectUser, fetchCreateUser, fetchProjectLeave, fetchUpdateProject } from '../../../requests.ts';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { CreateUserForm } from '../../user/CreateUserForm.tsx';
import { usePostAuthAction } from '../../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../../shared/lib/useRunPostAuthAction.ts';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { statusConfig } from '../../meets/helper.ts';
import { nextProjectMeet, moscowMeetStatus } from './project-card-meeting.ts';
import CardMedia from '@mui/material/CardMedia';
import LinkIcon from '@mui/icons-material/Link';
import ChatDialog from '../../../components/ChatDialog.tsx'; // Добавлен импорт
import ProjectForm, { type ProjectFormValues } from './ProjectForm.tsx';
import MenuButton from '../../../components/MenuButton.tsx';
import LogoutIcon from '@mui/icons-material/Logout';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat'; // Добавлен ChatIcon

const CREATE_PROJECT_USER_TYPE = 'create-project-user';

type Props = {
  project: ProjectDto;
  withoutIdea?: boolean;
  refetch?: () => void;
};

function ProjectCard({ project, refetch, withoutIdea }: Props) {
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const { passport, authHandler, refetch: refetchPassport, userId, role } = useAuth();
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Добавлено состояние
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const isMember = userId && project.users?.map(user => user.id).includes(userId);
  const firstMeet = nextProjectMeet(project.meets);
  const status = firstMeet ? statusConfig[moscowMeetStatus(firstMeet)] : undefined;
  const startedAt = firstMeet ? new Date(firstMeet.startedAt) : undefined;
  const date = startedAt?.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', timeZone: 'Europe/Moscow' });
  const time = startedAt?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });

  const [form, setForm] = useState<ProjectFormValues>({
    title: project.title || '',
    description: project.description || '',
    image: project.image ?? '',
    placeId: project.place.id,
    locationId: project.locationId ?? null,
  });

  const updateProject = useMutation({
    mutationFn: (data: ProjectFormValues) => fetchUpdateProject(project.id, data),

    onSuccess: () => {
      setEditModalOpen(false);
      refetch?.();
    },
  });

  const mutationLeave = useMutation({
    mutationFn: fetchProjectLeave,
    onSuccess: () => {
      refetch?.();
    },
  });

  useRunPostAuthAction(passport, action => {
    if (action.type === CREATE_PROJECT_USER_TYPE && action.payload?.projectId === project.id) {
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

    if (!userId) {
      setAction({
        type: CREATE_PROJECT_USER_TYPE,
        payload: { projectId: project.id },
      });

      return authHandler();
    }

    mutationLike.mutate({ userId, projectId: project.id });
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

  const menuItems = [];

  const onLeave = () => {
    if (userId) mutationLeave.mutate(project.id);
    else authHandler();
  };

  if (role === 'teacher' && project.passport.id === passport?.id) {
    menuItems.push({
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon fontSize="small" />,
      onClick: () => setEditModalOpen(true),
    });
  }
  if (role === 'user') {
    menuItems.push({
      key: 'message',
      label: 'Написать учителю',
      icon: <ChatIcon fontSize="small" />,
      onClick: () => setIsChatOpen(true),
    });
  }
  if (isMember && role === 'user') {
    menuItems.push({
      key: 'exit',
      label: 'Выйти из проекта',
      icon: <LogoutIcon fontSize="small" />,
      onClick: onLeave,
    });
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      {!withoutIdea && <>
        <CardActionArea onClick={() => navigate(`/project/${project.id}`)} aria-label={`Открыть проект ${project.title}`}>
          <CardMedia component="img" image={project.image || '/bg.jpeg'} alt={project.title || 'Проект'}
            sx={{ height: { xs: 280, sm: 320 }, objectFit: 'cover', display: 'block', bgcolor: 'background.default', boxSizing: 'border-box' }} />
          <CardContent>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>{project.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {project.description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardHeader
          avatar={<Avatar component={Link} to={`/teachers/${project.passport.id}`} alt={project.passport.title}
            src={project.passport.image || ''} variant="rounded">{project.passport.title?.[0]}</Avatar>}
          title={<Typography component={Link} to={`/teachers/${project.passport.id}`} variant="subtitle2"
            sx={{ color: 'text.primary', textDecoration: 'none' }}>{project.passport.title}</Typography>}
          subheader="Мастер проекта"
          action={<Stack direction="row">
            {project.idea?.id && <IconButton component={Link} to={`/idea/${project.idea.id}`} aria-label="Исходная идея" size="small"><LinkIcon fontSize="small" /></IconButton>}
            <MenuButton menuItems={menuItems} />
          </Stack>}
          sx={{ borderTop: 1, borderColor: 'divider', '& .MuiCardHeader-content': { minWidth: 0 } }} />
        <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, alignItems: 'flex-start' }}>
          <PlaceIcon fontSize="small" color="action" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
              {project.place.title}
              {project.location?.title?.trim() && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>{' · '}{project.location.title}</Box>}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>{project.place.address}</Typography>
          </Box>
        </Stack>
      </>}
      {withoutIdea && menuItems.length > 0 && <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1 }}><MenuButton menuItems={menuItems} /></Box>}
      <CardContent sx={{ bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
        {firstMeet && status ? <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{date}, {time} МСК</Typography>
            <Chip label={status.label} color={status.color} size="small" />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScheduleOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">{firstMeet.duration ?? 60} минут</Typography>
          </Stack>
        </Stack> : <Typography variant="body2" color="text.secondary">Ближайшая встреча не назначена</Typography>}
      </CardContent>

        {(Boolean(project.users.length) || role === 'user') && (
          <CardContent>
            <Stack spacing={2} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              {Boolean(project.users.length) && (
                <Box>
                  <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Участники проекта
                  </Typography>
                  <AvatarGroupUsers users={project.users || []} />
                </Box>
              )}

              {role === 'user' && !project.users.length && !isMember && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Станьте первым участником и помогите запустить проект
                </Typography>
              )}

              {role === 'user' && !isMember && (
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
        )}

      <Dialog open={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
        <DialogTitle>Создать ребенка</DialogTitle>
        <DialogContent>
          <CreateUserForm onSubmit={data => handleUserCreate(data.title)} />
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Редактирование проекта</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <ProjectForm
            values={form}
            onChange={setForm}
            onSubmit={() => updateProject.mutate(form)}
            loading={updateProject.isPending}
            error={updateProject.isError}
            submitLabel="Сохранить изменения"
          />
        </DialogContent>
      </Dialog>

      <ChatDialog open={isChatOpen} onClose={() => setIsChatOpen(false)} teacherId={project.passport?.id || 0} />
    </Card>
  );
}

export default ProjectCard;
