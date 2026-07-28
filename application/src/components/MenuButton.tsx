import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import type { MouseEvent } from 'react';

export type MenuItemType = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  sx?: object;
};

type MenuButtonProps = {
  menuItems: MenuItemType[];
};

export default function MenuButton({ menuItems }: MenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(null);
  };

  if (menuItems.length === 0) {
    return null;
  }

  return (
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
            sx={item.sx}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}