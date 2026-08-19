import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { LocationDto } from 'dto';

type Props = {
  location: LocationDto;
};

function LocationCard({ location }: Props) {
  return (
    <Card
      elevation={1}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom noWrap>
          {location.title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default LocationCard;
