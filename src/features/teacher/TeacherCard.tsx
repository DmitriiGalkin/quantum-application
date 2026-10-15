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
    <CardContent><Stack spacing={1}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Avatar src={teacher.image ?? undefined} alt={teacher.title} sx={{ width: 72, height: 72 }} />
        {actions}
      </Stack>
      <Typography variant="h6">{teacher.title}</Typography>
      {teacher.description && <Typography>{teacher.description.slice(0, 240)}</Typography>}
      <Button component={Link} to={`/teachers/${teacher.id}`}>Профиль преподавателя</Button>
    </Stack></CardContent>
  </Card>;
}
