import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { PlaceDto } from 'dto';
import CardMedia from '@mui/material/CardMedia';

type Props = {
  place: PlaceDto;
};

function PlaceCard({ place }: Props) {
  return (
    <Card>
      <CardMedia component="img" height="140" image={place.image || '/placeholder.jpg'} alt={place.title || 'Center'} />
      <CardContent>
        <Typography variant="h6">{place.title}</Typography>
        <Typography variant="body2">{place.address}</Typography>
      </CardContent>
    </Card>
  );
}

export default PlaceCard;
