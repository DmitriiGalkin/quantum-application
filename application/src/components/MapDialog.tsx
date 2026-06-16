import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import { PlaceMap } from './Map/PlaceMap.tsx';
import type { PlaceDto } from '@shared/types';

type MeetCardProps = {
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isAuthModalOpen: boolean) => void;
  onClick: (place: PlaceDto) => void;
};

function MapDialog({ isAuthModalOpen, setIsAuthModalOpen, onClick }: MeetCardProps) {
  return (
    <Dialog open={isAuthModalOpen} fullScreen={false} onClose={() => setIsAuthModalOpen(false)} fullWidth>
      <DialogTitle>
        <Button onClick={() => setIsAuthModalOpen(false)} startIcon={<CloseIcon />}>
          Закрыть
        </Button>
      </DialogTitle>
      <PlaceMap lat={55.75} lng={37.62} zoom={12} onClick={onClick} />
    </Dialog>
  );
}

export default MapDialog;
