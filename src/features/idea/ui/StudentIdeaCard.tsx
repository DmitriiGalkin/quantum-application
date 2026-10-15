import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { TeacherStudentIdeaDto } from 'entities';
import ProjectImage from '../../../components/ProjectImage.tsx';
import ChatDialog from '../../../components/ChatDialog.tsx';
import { DAY_MS, informationDate, moscowDay } from '../../meets/moscow-time.ts';

export default function StudentIdeaCard({ idea }: { idea: TeacherStudentIdeaDto }) {
  const [contact, setContact] = useState(false);
  const validDate = Number.isFinite(new Date(idea.createdAt).getTime());
  const days = validDate ? Math.max(0, Math.floor((moscowDay(new Date()) - moscowDay(idea.createdAt)) / DAY_MS)) : 0;
  const age = days === 0 ? 'создана сегодня' : days === 1 ? 'создана вчера' : `с момента создания: ${days} дн.`;
  return <Card component="article" sx={{ minWidth: 0 }}>
    <ProjectImage src={idea.image} alt={idea.title} />
    <CardContent><Stack spacing={2} sx={{ overflowWrap: 'anywhere' }}>
      <Typography component={Link} to={`/idea/${idea.id}`} variant="h6" sx={{ color: 'inherit' }}>{idea.title}</Typography>
      <Typography color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{idea.description}</Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Avatar src={idea.user.image ?? undefined} alt={idea.user.title}>{idea.user.title[0]}</Avatar>
        <Typography>{idea.user.title}{idea.user.age != null ? ` · ${idea.user.age} лет` : ''}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">{validDate ? `${informationDate(idea.createdAt)} · ${age}` : 'Дата не указана'}</Typography>
      <Stack spacing={1}>
        {!idea.projects.length && <Typography>Связанных проектов пока нет</Typography>}
        {idea.projects.map(project => <Stack key={project.id}>
          <Typography component={Link} to={`/project/${project.id}`}>{project.title}</Typography>
          <Typography variant="body2" color="text.secondary">{[
            project.enrolledInProject ? 'Ученик записан в проект' : null,
            project.enrolledInMeets ? 'Есть запись на встречу' : null,
          ].filter(Boolean).join(' · ') || 'Записи ученика нет'}</Typography>
        </Stack>)}
      </Stack>
      {idea.canContactParent && <Button onClick={() => setContact(true)} sx={{ alignSelf: 'flex-start' }}>Написать родителю</Button>}
    </Stack></CardContent>
    {contact && <ChatDialog open parentUserId={idea.user.id} onClose={() => setContact(false)} />}
  </Card>;
}
