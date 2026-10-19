import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import ChatIcon from '@mui/icons-material/Chat';
import ProjectImage from '../../../components/ProjectImage.tsx';
import Typography from '@mui/material/Typography';
import type { IdeaDto, TeacherStudentIdeaDto } from 'entities';
import CardActionArea from '@mui/material/CardActionArea';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ChatDialog from '../../../components/ChatDialog.tsx';
import { DAY_MS, informationDate, moscowDay } from '../../meets/moscow-time.ts';

interface IdeaCardData {
  id: number;
  title: string;
  description: string;
  image: string | null;
}

type IdeaCardProps = {
  idea: IdeaDto | IdeaCardData | TeacherStudentIdeaDto;
};

function isStudentIdea(idea: IdeaCardProps['idea']): idea is TeacherStudentIdeaDto {
  return 'canContactParent' in idea && 'projects' in idea && idea.user != null;
}

function IdeaCard({ idea }: IdeaCardProps) {
  const [contact, setContact] = useState(false);
  const studentIdea = isStudentIdea(idea) ? idea : null;
  const validDate = studentIdea && Number.isFinite(new Date(studentIdea.createdAt).getTime());
  const days = validDate && studentIdea
    ? Math.max(0, Math.floor((moscowDay(new Date()) - moscowDay(studentIdea.createdAt)) / DAY_MS)) : 0;
  const age = days === 0 ? 'создана сегодня' : days === 1 ? 'создана вчера' : `с момента создания: ${days} дн.`;
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
      <CardActionArea component={Link} to={`/idea/${idea.id}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
        <ProjectImage src={idea.image} alt={idea.title} />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }} gutterBottom>
            {idea.title}
          </Typography>

          <Typography
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              color: 'text.secondary',
            }}
          >
            {idea.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      {studentIdea && <CardContent sx={{ pt: 0, overflowWrap: 'anywhere' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Avatar src={studentIdea.user.image ?? undefined} alt={studentIdea.user.title}>{studentIdea.user.title[0]}</Avatar>
            <Typography sx={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
              {studentIdea.user.title}{studentIdea.user.age != null ? ` · ${studentIdea.user.age} лет` : ''}
            </Typography>
            {studentIdea.canContactParent && <Tooltip title="Написать сообщение">
              <IconButton onClick={() => setContact(true)} aria-label="Написать сообщение" size="small">
                <ChatIcon fontSize="small" />
              </IconButton>
            </Tooltip>}
          </Stack>
          <Typography variant="body2" color="text.secondary">{validDate ? `${informationDate(studentIdea.createdAt)} · ${age}` : 'Дата не указана'}</Typography>
        </Stack>
      </CardContent>}
      {studentIdea && contact && <ChatDialog open parentUserId={studentIdea.user.id} onClose={() => setContact(false)} />}
    </Card>
  );
}

export default IdeaCard;
