import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { PlaceDto } from 'entities';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import PlaceIcon from '@mui/icons-material/Place';
import { Link } from 'react-router-dom';

type Props = {
  place: PlaceDto;
};

function PlaceCard({ place }: Props) {
  return (
    <Card>
      <CardActionArea component={Link} to={`/places/${place.id}`}>
      {place.image ? <CardMedia component="img" image={place.image} alt={place.title || 'Центр'} sx={{ height: { xs: 140, sm: 180 }, objectFit: 'contain', bgcolor: 'background.default' }} />
        : <Box sx={{ height: { xs: 140, sm: 180 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}><PlaceIcon sx={{ fontSize: 48 }} color="action" /></Box>}
      <CardContent sx={{ overflowWrap: 'anywhere' }}>
        <Typography variant="h6">{place.title}</Typography>
        <Typography variant="body2">{place.address}</Typography>
        {place.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>{place.description}</Typography>}
      </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default PlaceCard;
