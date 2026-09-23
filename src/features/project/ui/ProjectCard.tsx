import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Button, Card, CardActionArea, CardContent, CardHeader, Chip, IconButton, Stack } from '@mui/material';
import type { ProjectDto } from 'entities';
import AvatarGroupUsers from 'components/AvatarGroupUsers.tsx';
import { useAuth } from '../../../providers/AuthProvider.tsx';
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
import { getMeetStatus, statusConfig } from '../../meets/helper.ts';
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
  refetch?: any;
};

function ProjectCard({ project, refetch, withoutIdea }: Props) {
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const { passport, authHandler, refetch: refetchPassport, userId, role } = useAuth();
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Добавлено состояние
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const isMember = userId && project.users?.map(user => user.id).includes(userId);
  const sortedMeets = [...project.meets].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  const now = new Date();

  const firstMeet = sortedMeets.find(m => m.startedAt); //new Date(m.startedAt) > now

  const status = firstMeet ? statusConfig[getMeetStatus(firstMeet)] : undefined;
  const startedAt = new Date(firstMeet?.startedAt || new Date());
  const date = startedAt.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
  });

  const time = startedAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const [form, setForm] = useState<ProjectFormValues>({
    title: project.passport?.title || '',
    description: project.description || '',
    image: project.image ?? '',
    placeId: project.place.id,
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
      <CardActionArea
        sx={{
          '&:hover': {
            bgcolor: 'rgba(255,160,40,.05)',
          },
        }}
        onClick={() => navigate(`/project/${project.id}`)}
      >
        {!withoutIdea && (
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <CardHeader
              avatar={
                <Link to={`/teachers/${project.passport?.id}`} style={{ textDecoration: 'none' }}>
                  <Avatar alt={project.passport?.title} src={project.passport?.image || ''} variant="rounded">
                    R
                  </Avatar>
                </Link>
              }
              action={<MenuButton menuItems={menuItems} />}
              title={
                <Typography variant="subtitle1" component="span">
                  {project.passport?.title}
                </Typography>
              }
              subheader={
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: 'center',
                    minWidth: 0,
                  }}
                >
                  <PlaceIcon sx={{ fontSize: 12, opacity: 0.6, flexShrink: 0 }} />

                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {project.place.address}
                  </Typography>
                </Stack>
              }
              sx={{
                backgroundColor: project.passport?.id === passport?.id ? 'rgba(255,160,40,.1)' : 'rgba(255,255,255,.7)',
                boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,

                // Самое важное
                '& .MuiCardHeader-content': {
                  minWidth: 0,
                },

                '& .MuiCardHeader-action': {
                  flexShrink: 0,
                },
              }}
            />

            <CardMedia
              component="img"
              height="300"
              image={project.image || `/bg.jpeg`}
              alt={project.title || 'Проект'}
              sx={{
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <CardContent
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 65%, rgba(255,255,255,0) 100%)',
                color: 'text.primary', // Темный цвет текста по умолчанию из темы MUI
                padding: '16px',
                pt: '32px', // Дополнительный верхний отступ, чтобы текст не залезал на прозрачную часть градиента
                '&:last-child': { paddingBottom: '16px' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography component="h1" variant="h6" gutterBottom sx={{ color: 'text.primary', margin: 0, fontWeight: 600 }}>
                  {project.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={e => {
                    e.stopPropagation(); // важно: чтобы не триггерить Card click
                    navigate(`/idea/${project.idea?.id || 0}`);
                  }}
                  sx={{
                    color: 'text.primary', // Темная иконка
                    opacity: 0.6,
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.875rem' }}>{project.description}</Typography>
            </CardContent>
          </Box>
        )}

        {firstMeet && status ? (
          <CardContent sx={{ backgroundColor: 'rgba(255,160,40,.1)' }}>
            <Box sx={{ position: 'relative' }}>
              <Chip label={status.label} color={status.color} size="small" sx={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)' }} />
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }} spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    <b>{date}</b>,
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {time}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ScheduleOutlinedIcon fontSize="small" color="disabled" />
                  <Typography variant="body2">{firstMeet.duration} минут</Typography>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        ) : (
          <>
            {role === 'teacher' && project.passport.id === passport?.id ? (
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
      </CardActionArea>

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
