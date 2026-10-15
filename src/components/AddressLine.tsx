import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export default function AddressLine({ address, full = false }: { address?: string | null; full?: boolean }) {
  const [open, setOpen] = useState(false);
  if (full) return <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>{address}</Typography>;
  return <Tooltip title={address || 'Адрес не указан'} open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
    <Typography component="button" type="button" variant="caption" color="text.secondary"
      onClick={() => setOpen(true)} onBlur={() => setOpen(false)}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}
      aria-label={`Полный адрес: ${address || 'не указан'}`} aria-expanded={open}
      sx={{ display: 'block', width: '100%', minWidth: 0, textAlign: 'left', font: 'inherit', border: 0, p: 0,
        bgcolor: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {address || 'Адрес не указан'}
    </Typography>
  </Tooltip>;
}
