import MUIDriwer from '@mui/material/Drawer';
import '../App.css';
import Menu from './Menu.tsx';


interface DrawerProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}

function Drawer({ isMenuOpen, setIsMenuOpen }: DrawerProps) {

  return (
    <MUIDriwer
      open={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      sx={{
        zIndex: theme => theme.zIndex.appBar + 1,
      }}
      anchor="right"
    >
      <Menu setIsMenuOpen={setIsMenuOpen} />
    </MUIDriwer>
  );
}

export default Drawer;
