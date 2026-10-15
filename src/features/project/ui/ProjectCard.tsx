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
import ClosableDialogTitle from '../../../components/ClosableDialogTitle.tsx';
import DialogContent from '@mui/material/DialogContent';
import { CreateUserForm } from '../../user/CreateUserForm.tsx';
import { usePostAuthAction } from '../../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../../shared/lib/useRunPostAuthAction.ts';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { statusConfig } from '../../meets/helper.ts';
import { upcomingPublishedMeets, moscowMeetStatus } from './project-card-meeting.ts';
import ProjectImage from '../../../components/ProjectImage.tsx';
import LinkIcon from '@mui/icons-material/Link';
import ChatDialog from '../../../components/ChatDialog.tsx'; // Добавлен импорт
import ProjectForm, { type ProjectFormValues } from './ProjectForm.tsx';
import MenuButton from '../../../components/MenuButton.tsx';
import LogoutIcon from '@mui/icons-material/Logout';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat'; // Добавлен ChatIcon
import Tooltip from '@mui/material/Tooltip';

const CREATE_PROJECT_USER_TYPE = 'create-project-user';

type Props = {
  project: ProjectDto;
  withoutIdea?: boolean;
  refetch?: () => void;
  detailed?: boolean;
};

function ProjectCard({ project, refetch, detailed = false }: Props) {
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const { passport, authHandler, refetch: refetchPassport, userId, role } = useAuth();
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Добавлено состояние
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const isMember = userId && project.users?.map(user => user.id).includes(userId);
  const firstMeet = upcomingPublishedMeets(project.meets)[0];
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
    if (action.type === 'project-chat' && action.payload?.projectId === project.id) setIsChatOpen(true);
  }, action => action.payload?.projectId === project.id
    && (action.type === CREATE_PROJECT_USER_TYPE || action.type === 'project-chat'));

  const openChat = () => {
    if (!passport) {
      setAction({ type: 'project-chat', payload: { projectId: project.id } });
      return authHandler();
    }
    setIsChatOpen(true);
  };

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
      <>
        <CardActionArea onClick={() => navigate(`/project/${project.id}`)} aria-label={`Открыть проект ${project.title}`}>
          <ProjectImage src={project.image} alt={project.title || 'Проект'} />
        </CardActionArea>
        <CardContent>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography component={detailed ? 'h1' : 'h2'} variant={detailed ? 'h4' : 'h6'} sx={{ flex: '1 1 140px', minWidth: 0, fontWeight: 600, overflowWrap: 'anywhere' }}>
              <Box component={Link} to={`/project/${project.id}`} sx={{ color: 'inherit', textDecoration: 'none' }}>{project.title}</Box>
            </Typography>
            {project.idea?.id && <Tooltip title="Посмотреть исходную идею проекта">
            <Button component={Link} to={`/idea/${project.idea.id}`} aria-label="Исходная идея" size="small" startIcon={<LinkIcon fontSize="small" />}>
              Исходная идея
            </Button>
            </Tooltip>}
          </Stack>
          <Typography variant={detailed ? 'body1' : 'body2'} color="text.secondary" sx={{ mt: 1, ...(!detailed && { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }), whiteSpace: detailed ? 'pre-line' : undefined, overflowWrap: 'anywhere' }}>
            {project.description}
          </Typography>
        </CardContent>
        <CardHeader
          avatar={<Avatar component={Link} to={`/teachers/${project.passport.id}`} alt={project.passport.title}
            src={project.passport.image || ''} variant="rounded">{project.passport.title?.[0]}</Avatar>}
          title={<Typography component={Link} to={`/teachers/${project.passport.id}`} variant="subtitle2"
            sx={{ color: 'text.primary', textDecoration: 'none', overflowWrap: 'anywhere' }}>{project.passport.title}</Typography>}
          subheader="Мастер проекта"
          action={<Stack direction="row">
            {project.passport.id !== passport?.id && <Tooltip title="Написать учителю">
              <IconButton onClick={openChat} aria-label="Написать учителю" size="small"><ChatIcon fontSize="small" /></IconButton>
            </Tooltip>}
            <MenuButton menuItems={menuItems} />
          </Stack>}
          sx={{ borderTop: 1, borderColor: 'divider', '& .MuiCardHeader-content': { minWidth: 0 } }} />
        <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2, alignItems: 'flex-start' }}>
          <PlaceIcon fontSize="small" color="action" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
              <Box component={Link} to={`/places/${project.place.id}`} sx={{ color: 'inherit' }}>{project.place.title}</Box>
              {project.location?.title?.trim() && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>{' · '}{project.location.title}</Box>}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>{project.place.address}</Typography>
          </Box>
        </Stack>
      </>
      <CardContent sx={{ bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
        {firstMeet && status ? <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography component={Link} to={`/project/${project.id}#meet-${firstMeet.id}`} variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>{date}, {time} МСК</Typography>
            <Chip label={status.label} color={status.color} size="small" />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScheduleOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">{firstMeet.duration ?? 60} минут</Typography>
            {firstMeet.price != null && <Typography variant="body2">{firstMeet.price} ₽</Typography>}
          </Stack>
        </Stack> : <Typography variant="body2" color="text.secondary">Ближайшая встреча не назначена</Typography>}
      </CardContent>

        {(Boolean(project.users.length) || role === 'user') && (
          <CardContent>
            <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {Boolean(project.users.length) && (
                <Box sx={{ maxWidth: '100%' }}>
                  <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Участники проекта
                  </Typography>
                  <AvatarGroupUsers users={project.users || []} limit={10} />
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
        <ClosableDialogTitle onClose={() => setUserModalOpen(false)}>Создать ребенка</ClosableDialogTitle>
        <DialogContent>
          <CreateUserForm onSubmit={data => handleUserCreate(data.title)} />
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="md">
        <ClosableDialogTitle onClose={() => setEditModalOpen(false)}>Редактирование проекта</ClosableDialogTitle>

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
