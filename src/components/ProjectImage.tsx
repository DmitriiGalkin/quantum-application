import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { colors } from '../theme/design-tokens';

interface Props { src?: string | null; alt?: string }

function ImageContent({ src }: Pick<Props, 'src'>) {
  const [failed, setFailed] = useState(false);
  const [portrait, setPortrait] = useState(false);
  if (src && !failed) return <Box component="img" src={src} alt="" loading="lazy"
    onError={() => setFailed(true)} onLoad={event => setPortrait(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight < 0.8)}
    sx={{ width: '100%', height: '100%', objectFit: portrait ? 'contain' : 'cover', display: 'block' }} />;
  return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, p: 2,
    background: `linear-gradient(135deg, ${colors.selected}, ${colors.peach})` }}>
    <AutoAwesomeIcon aria-hidden sx={{ color: 'primary.main', fontSize: 40 }} />
    <Typography variant="body2" sx={{ color: 'text.primary', textAlign: 'center' }}>Здесь рождается новый проект</Typography>
  </Box>;
}

export default function ProjectImage({ src, alt }: Props) {
  return <Box role={alt ? 'img' : undefined} aria-label={alt || undefined}
    sx={{ aspectRatio: '3 / 2', overflow: 'hidden', bgcolor: colors.disabledSurface, minWidth: 0 }}>
    <ImageContent key={src || 'missing'} src={src} />
  </Box>;
}
