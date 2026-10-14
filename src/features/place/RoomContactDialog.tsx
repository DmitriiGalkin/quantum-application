import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PlaceDto, RoomDto } from 'entities';

interface RoomContactDialogProps {
  room?: RoomDto;
  place: PlaceDto;
  onClose: () => void;
}

export function RoomContactDialog({ room, place, onClose }: RoomContactDialogProps) {
  return <Dialog open={Boolean(room)} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="room-contact-title">
    <DialogTitle id="room-contact-title">Арендовать зал «{room?.title}»</DialogTitle>
    <DialogContent><Stack spacing={2}>
      <Typography>Чтобы уточнить доступность, стоимость и условия аренды, свяжитесь с центром.</Typography>
      <Typography variant="h6">{place.title}</Typography>
      {place.phone ? <Button component="a" href={`tel:${place.phone}`} variant="contained">{place.phone}</Button>
        : <><Typography>Телефон центра пока не указан.</Typography><Typography>{place.address}</Typography></>}
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose}>Закрыть</Button></DialogActions>
  </Dialog>;
}
