import type { ReactNode } from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

interface CardTeacherLineProps {
  id: number;
  title: string;
  image?: string | null;
  action?: ReactNode;
}

export default function CardTeacherLine({ id, title, image, action }: CardTeacherLineProps) {
  return <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
    <Avatar component={Link} to={`/teachers/${id}`} alt={title} src={image || ''} variant="rounded"
      sx={{ width: 32, height: 32, fontSize: '0.875rem', flexShrink: 0 }}>{title?.[0]}</Avatar>
    <Typography component={Link} to={`/teachers/${id}`} variant="subtitle2"
      sx={{ color: 'text.primary', textDecoration: 'none', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
      {title}
    </Typography>
    {action}
  </Stack>;
}
