import type { PassportDto } from '@shared/types';
import { Avatar, CardHeader, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/Mail';

type Props = {
  passport: PassportDto;
  handleUnlike?: any;
};

function ProjectCardHeader({ passport, handleUnlike }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  return (
    <CardHeader
      avatar={
        <Avatar alt={passport.title} src={passport.image || ''}>
          R
        </Avatar>
      }
      action={
        <>
          <IconButton onClick={handleOpen}>
            <MoreVertIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleClose();
                console.log('send message');
              }}
              disabled
            >
              <ListItemIcon>
                <MailOutlineIcon fontSize="small" />
              </ListItemIcon>
              Написать письмо
            </MenuItem>
            {handleUnlike && (
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleUnlike();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Выйти из проекта
              </MenuItem>
            )}
          </Menu>
        </>
      }
      title={passport.title}
      subheader="Программист трудоголик"
    />
  );
}

export default ProjectCardHeader;
