import type { PlaceDto, ProjectExtendedDto } from '@shared/types';
import { Avatar, CardHeader, Stack } from '@mui/material';
import MenuButton from '../../components/MenuButton';
import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import PlaceIcon from '@mui/icons-material/Place';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchProjectLeave, fetchUpdateProject } from '../../requests.ts';
import EditIcon from '@mui/icons-material/Edit';
import ChatIcon from '@mui/icons-material/Chat'; // Добавлен ChatIcon
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ProjectForm, { type ProjectFormValues } from './ProjectForm.tsx';
import { Link } from 'react-router-dom';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

type Props = {
  project: ProjectExtendedDto;
  place: PlaceDto;
  refetch?: () => void;
  onMessageTeacher?: () => void; // Добавлен обработчик
};

function ProjectCardHeader({ project, place, refetch, onMessageTeacher }: Props) {
  const { activeUser, authHandler, activeContext, passport } = useAuth();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const isMember = activeUser && project.users?.map(user => user.id).includes(activeUser.id);

  const [form, setForm] = useState<ProjectFormValues>({
    title: project.passport.title,
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

  const menuItems = [];

  const onLeave = () => {
    if (activeUser) mutationLeave.mutate(project.id);
    else authHandler();
  };

  if (activeContext.role === 'teacher' && project.passport.id === passport?.id) {
    menuItems.push({
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon fontSize="small" />,
      onClick: () => setEditModalOpen(true),
    });
  }

  menuItems.push({
    key: 'message',
    label: 'Написать учителю',
    icon: <ChatIcon fontSize="small" />,
    onClick: () => onMessageTeacher?.(),
  });

  if (isMember && activeContext.role === 'user') {
    menuItems.push({
      key: 'exit',
      label: 'Выйти из проекта',
      icon: <LogoutIcon fontSize="small" />,
      onClick: onLeave,
    });
  }

  return (
    <>
      <CardHeader
        avatar={
          <Link to={`/teacher/${project.passport.id}`} style={{ textDecoration: 'none' }}>
            <Avatar alt={project.passport.title} src={project.passport.image || ''}>
              R
            </Avatar>
          </Link>
        }
        action={<MenuButton menuItems={menuItems} />}
        title={
          <Link to={`/teacher/${project.passport.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" component="span">
                {project.passport.title}
              </Typography>
              <ArrowOutwardIcon fontSize="small" sx={{ opacity: 0.7 }} />
            </Stack>
          </Link>
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
              {place.address}
            </Typography>
          </Stack>
        }
        sx={{
          backgroundColor: project.passport.id === passport?.id ? 'rgba(255,160,40,.1)' : '#F8F9FB',
          boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1)',

          // Самое важное
          '& .MuiCardHeader-content': {
            minWidth: 0,
          },

          '& .MuiCardHeader-action': {
            flexShrink: 0,
          },
        }}
      />
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
    </>
  );
}

export default ProjectCardHeader;
