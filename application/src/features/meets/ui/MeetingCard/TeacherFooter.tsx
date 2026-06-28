import { Button, IconButton, ListItemIcon, Menu, MenuItem, Stack } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';

interface Props {
  onEdit: () => void;
  onDelete?: () => void;
}

export default function TeacherFooter({ onEdit, onDelete }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  return (
    <Stack spacing={1.5} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Button variant="contained" fullWidth onClick={onEdit}>
        Изменить
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={e => {
            handleClose(e);
            onDelete?.();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Удалить встречу
        </MenuItem>
      </Menu>

      <IconButton onClick={handleOpen}>
        <MoreVertIcon />
      </IconButton>
    </Stack>
  );
}
