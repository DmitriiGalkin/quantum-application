import type { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { RoomDto } from 'entities';
import { RoomGallery } from './RoomGallery.tsx';
import { formatMoney } from '../../utils/time.ts';

interface LocationCardProps {
  location: RoomDto;
  actions?: ReactNode;
  showRate?: boolean;
}

export default function LocationCard({ location, actions, showRate = true }: LocationCardProps) {
  return <Card id={`room-${location.id}`} sx={{ height: '100%', borderRadius: 4, overflow: 'hidden', scrollMarginTop: 90, display: 'flex', flexDirection: 'column' }}>
    <RoomGallery title={location.title} photos={location.photos} />
    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h6">{location.title}</Typography>
      {location.capacity !== null && <Typography>Вместимость: {location.capacity} человек</Typography>}
      {showRate && <Typography>Аренда для преподавателя: {location.hourlyRate === null ? 'ставка не указана' : `${formatMoney(location.hourlyRate)} / час`}</Typography>}
      {location.description && <Typography sx={{ whiteSpace: 'pre-line' }}>{location.description}</Typography>}
      {actions}
    </CardContent>
  </Card>;
}
