import {Link} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import MUIDriwer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import '../App.css';
import { useAuth } from '../providers/AuthProvider.tsx';
import Menu from './Menu.tsx';


interface DrawerProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}

function Drawer({ isMenuOpen, setIsMenuOpen }: DrawerProps) {
  const { user, logout } = useAuth();

  return (
    <MUIDriwer
      open={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      sx={{
        zIndex: theme => theme.zIndex.appBar - 1,
      }}
    >
      <Menu setIsMenuOpen={setIsMenuOpen} />
    </MUIDriwer>
  );
}

export default Drawer;
