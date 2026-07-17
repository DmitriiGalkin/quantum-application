import type { PlaceDto, ProjectExtendedDto } from '@shared/types';
import { Avatar, CardHeader, IconButton, ListItemIcon, Menu, MenuItem, Stack } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import PlaceIcon from '@mui/icons-material/Place';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchProjectLeave } from '../../requests.ts';

type Props = {
  project: ProjectExtendedDto;
  place: PlaceDto;
  refetch?: () => void;
};

function ProjectCardHeader({ project, place, refetch }: Props) {
  const passport = project.passport;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { activeUser, authHandler, activeContext } = useAuth();
  const isMember = activeUser && project.users?.map(user => user.id).includes(activeUser.id);

  const mutationLeave = useMutation({
    mutationFn: fetchProjectLeave,
    onSuccess: () => {
      refetch?.();
    },
  });

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const menuItems = [];

  const onLeave = () => {
    if (activeUser) mutationLeave.mutate(project.id);
    else authHandler();
  };

  if (isMember && activeContext.role === 'user') {
    menuItems.push({
      key: 'exit',
      label: 'Выйти из проекта',
      icon: <LogoutIcon fontSize="small" />,
      onClick: onLeave,
    });
  }

  return (
    <CardHeader
      avatar={
        <Avatar alt={passport.title} src={passport.image || ''}>
          R
        </Avatar>
      }
      action={
        menuItems.length > 0 ? (
          <>
            <IconButton onClick={handleOpen}>
              <MoreVertIcon />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {menuItems.map(item => (
                <MenuItem
                  key={item.key}
                  onClick={e => {
                    handleClose(e);
                    item.onClick();
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : undefined
      }
      title={passport.title}
      subheader={
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <PlaceIcon sx={{ fontSize: 12, opacity: 0.6 }} />
          <Typography component="div" variant="subtitle2" noWrap sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {place.address}
          </Typography>
        </Stack>
      }
      sx={{
        backgroundColor: 'rgba(255,160,40,.1)',
      }}
    />
  );
}

export default ProjectCardHeader;
