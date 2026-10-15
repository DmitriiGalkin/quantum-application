import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { MouseEvent } from 'react';
import { useId, useState } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

export interface MenuItemType {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  sx?: SxProps<Theme>;
}

type MenuButtonProps = {
  menuItems: MenuItemType[];
};

export default function MenuButton({ menuItems }: MenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();

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
      <IconButton onClick={handleOpen} aria-label="Действия" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}>
        <MoreVertIcon />
      </IconButton>

      <Menu id={menuId} anchorEl={anchorEl} open={open} onClose={handleClose}>
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
