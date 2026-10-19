import { useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlaceIcon from '@mui/icons-material/Place';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

interface CardVenueLineProps {
  id: number;
  title: string;
  address?: string | null;
  room?: string | null;
}

export default function CardVenueLine({ id, title, address, room }: CardVenueLineProps) {
  const [addressOpen, setAddressOpen] = useState(false);
  return <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
    <PlaceIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <Tooltip title={address || 'Адрес не указан'} open={addressOpen}
        onOpen={() => setAddressOpen(true)} onClose={() => setAddressOpen(false)}>
        <Typography component="button" type="button" variant="body2"
          onClick={() => setAddressOpen(true)} onBlur={() => setAddressOpen(false)}
          onKeyDown={event => { if (event.key === 'Escape') setAddressOpen(false); }}
          aria-label={`Показать адрес центра ${title}`} aria-expanded={addressOpen}
          sx={{ fontWeight: 600, color: 'text.primary', border: 0, p: 0,
            bgcolor: 'transparent', cursor: 'pointer', textAlign: 'left', minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
          {title}
        </Typography>
      </Tooltip>
      {room?.trim() && <Typography variant="body2" color="text.secondary"
        sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {' · '}{room}
      </Typography>}
    </Stack>
    <Box sx={{ flexShrink: 0 }}>
      <IconButton component={Link} to={`/places/${id}`} size="small" aria-label={`Открыть страницу центра ${title}`}>
        <ArrowForwardIcon fontSize="small" />
      </IconButton>
    </Box>
  </Stack>;
}
