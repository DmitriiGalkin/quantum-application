import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { TeacherDto } from 'entities';

interface TeacherCardProps {
  teacher: TeacherDto;
  actions?: ReactNode;
  highlighted?: boolean;
}

export default function TeacherCard({ teacher, actions, highlighted = false }: TeacherCardProps) {
  return <Card sx={{ height: '100%', bgcolor: highlighted ? 'action.selected' : undefined }}>
    <CardContent><Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Avatar src={teacher.image ?? undefined} alt={teacher.title} sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, flexShrink: 0 }} />
      <Stack spacing={1} sx={{ minWidth: 0, overflowWrap: 'anywhere', flex: 1 }}>
      <Typography variant="h6">{teacher.title}</Typography>
      {teacher.description && <Typography sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{teacher.description}</Typography>}
      <Button component={Link} to={`/teachers/${teacher.id}`}>Профиль преподавателя</Button>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>{actions}</Stack>
    </Stack></Stack></CardContent>
  </Card>;
}
