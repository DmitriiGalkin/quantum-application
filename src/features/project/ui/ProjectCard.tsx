import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import type { ProjectDto } from 'entities';
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
import { statusConfig } from '../../meets/helper.ts';
import { upcomingPublishedMeets, moscowMeetStatus } from './project-card-meeting.ts';
import { meetingDate } from '../../meets/moscow-time.ts';
import ProjectImage from '../../../components/ProjectImage.tsx';
import LinkIcon from '@mui/icons-material/Link';
import ChatDialog from '../../../components/ChatDialog.tsx'; // Добавлен импорт
import ProjectForm, { type ProjectFormValues } from './ProjectForm.tsx';
import MenuButton from '../../../components/MenuButton.tsx';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat'; // Добавлен ChatIcon
import Tooltip from '@mui/material/Tooltip';
import { formatWeeklySchedule } from './weekly-schedule.ts';
import CardTeacherLine from '../../../components/CardTeacherLine.tsx';
import CardVenueLine from '../../../components/CardVenueLine.tsx';

const CREATE_PROJECT_USER_TYPE = 'create-project-user';

type Props = {
  project: ProjectDto;
  withoutIdea?: boolean;
  refetch?: () => void;
  detailed?: boolean;
  variant?: 'standard' | 'catalog';
};

function ProjectCard({ project, refetch, detailed = false, variant = 'standard' }: Props) {
  const navigate = useNavigate();
  const { setAction } = usePostAuthAction();
  const { passport, authHandler, refetch: refetchPassport, userId, role } = useAuth();
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Добавлено состояние
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const isMember = userId && project.users?.map(user => user.id).includes(userId);
  const firstMeet = upcomingPublishedMeets(project.meets)[0];
  const temporalStatus = firstMeet ? moscowMeetStatus(firstMeet) : null;
  const status = temporalStatus ? statusConfig[temporalStatus] : undefined;
  const startedAt = firstMeet ? new Date(firstMeet.startedAt) : undefined;
  const date = startedAt ? meetingDate(startedAt, { month: 'short' }) : undefined;
  const time = startedAt?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });
  const endTime = startedAt && firstMeet?.duration != null
    ? new Date(startedAt.getTime() + firstMeet.duration * 60000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' }) : undefined;
  const meetingPlace = firstMeet?.place ?? project.place;
  const meetingRoom = firstMeet?.location ?? project.location;
  const freePlaces = firstMeet?.maxParticipants == null ? null
    : Math.max(0, firstMeet.maxParticipants - (firstMeet.participantCount ?? firstMeet.users?.length ?? 0));

  const [form, setForm] = useState<ProjectFormValues>({
    kind: project.kind ?? 'project',
    weeklySchedule: project.weeklySchedule ?? [],
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

  if (detailed && role === 'teacher' && project.passport.id === passport?.id) {
    menuItems.push({
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon fontSize="small" />,
      onClick: () => setEditModalOpen(true),
    });
  }
  if (detailed && isMember && role === 'user') {
    menuItems.push({
      key: 'exit',
      label: 'Выйти из проекта',
      icon: <LogoutIcon fontSize="small" />,
      onClick: onLeave,
    });
  }

  const metaAction = <Stack direction="row">
    {project.passport.id !== passport?.id && <Tooltip title="Написать учителю">
      <IconButton onClick={openChat} aria-label="Написать учителю" size="small"><ChatIcon fontSize="small" /></IconButton>
    </Tooltip>}
    <MenuButton menuItems={menuItems} />
  </Stack>;
  const meetingSummary = <Stack spacing={0.5}>
    {project.kind === 'regular' && Boolean(project.weeklySchedule?.length) && <Typography variant="body2">
      Занятия: {formatWeeklySchedule(project.weeklySchedule!)}
    </Typography>}
    {firstMeet ? <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
          <Typography component={Link} to={`/project/${project.id}#meet-${firstMeet.id}`} variant="body2"
            sx={{ fontWeight: 700, color: 'inherit', overflowWrap: 'anywhere' }}>
            {date} · {time}{endTime ? `–${endTime}` : ''}
          </Typography>
          {status && <Chip label={status.label} color={status.color} size="small" />}
        </Stack>
        {firstMeet.price === 0 ? <Chip size="small" label="Бесплатно" />
          : <Typography variant="body2" sx={{ fontWeight: 600 }}>{firstMeet.price == null ? 'Стоимость уточняется' : `${firstMeet.price.toLocaleString('ru-RU')} ₽`}</Typography>}
      </Stack>
      {freePlaces !== null && <Typography variant="caption" color={freePlaces === 0 ? 'error' : 'text.secondary'}>
        {freePlaces === 0 ? 'Мест нет' : `Свободно мест: ${freePlaces}`}
      </Typography>}
    </> : <Typography variant="body2" color="text.secondary">
      {project.kind === 'regular' ? 'Запись на ближайшее занятие пока недоступна' : 'Ближайшая встреча не назначена'}
    </Typography>}
  </Stack>;
  const title = <><Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start', minWidth: 0 }}>
    {project.kind === 'regular' && <Chip label="Кружок / секция" size="small" sx={{ flexShrink: 0 }} />}
    <Typography component={detailed ? 'h1' : 'h2'} variant={detailed ? 'h4' : 'h6'}
      sx={{ flex: '1 1 0', minWidth: 0, fontWeight: 600, overflowWrap: 'anywhere' }}>
      <Box component={Link} to={`/project/${project.id}`} sx={{ color: 'inherit', textDecoration: 'none' }}>{project.title}</Box>
    </Typography>
  </Stack>
    {detailed && project.idea?.id && <Tooltip title="Посмотреть исходную идею проекта">
      <Button component={Link} to={`/idea/${project.idea.id}`} aria-label="Исходная идея" size="small" startIcon={<LinkIcon fontSize="small" />}>
        Исходная идея
      </Button>
    </Tooltip>}
  </>;
  const description = project.description && <Typography variant={detailed ? 'body1' : 'body2'} color="text.secondary"
    sx={{ mt: 1, ...(!detailed && { display: '-webkit-box', WebkitLineClamp: variant === 'catalog' ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
      whiteSpace: detailed ? 'pre-line' : undefined, overflowWrap: 'anywhere' }}>
    {project.description}
  </Typography>;

  return (
    <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <CardActionArea onClick={() => navigate(`/project/${project.id}`)} aria-label={`Открыть проект ${project.title}`}>
        <ProjectImage src={project.image} alt={project.title || 'Проект'} />
      </CardActionArea>
      <CardContent sx={{ flexGrow: variant === 'catalog' ? 1 : undefined }}>
        {title}
        <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}>{meetingSummary}</Box>
        <Box sx={{ mt: 1.5 }}><CardVenueLine id={meetingPlace.id} title={meetingPlace.title || 'Центр не указан'}
          address={meetingPlace.address} room={meetingRoom?.title} /></Box>
        {description}
      </CardContent>
      <Stack sx={{ borderTop: 1, borderColor: 'divider', px: 2, py: 1.5 }}>
        <CardTeacherLine id={project.passport.id} title={project.passport.title} image={project.passport.image} action={metaAction} />
      </Stack>

        {detailed && role === 'user' && !isMember && (
          <CardContent sx={{ bgcolor: 'action.hover', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Button variant="contained" size="small" onClick={onJoin}>Вступить</Button>
            {project.kind === 'regular' && <Typography variant="caption" color="text.secondary" sx={{ flex: '1 1 180px' }}>
              Участие в кружке не бронирует место на отдельных занятиях.
            </Typography>}
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
