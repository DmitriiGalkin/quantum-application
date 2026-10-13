import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Link } from 'react-router-dom';
import type { ProjectDto } from 'entities';
import AvatarGroupUsers from '../../../components/AvatarGroupUsers.tsx';
import { formatMoscowMeet, upcomingPublishedMeets } from './project-card-meeting.ts';

export default function ProjectTable({ projects }: { projects: ProjectDto[] }) {
  return <Stack spacing={1} aria-label="Таблица проектов">
    {projects.map(project => {
      const meet = upcomingPublishedMeets(project.meets)[0];
      return <Box key={project.id} component="article" sx={{
        display: 'flex', border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden',
        bgcolor: 'background.paper', overflowWrap: 'anywhere',
      }}>
        <Box sx={{ position: 'relative', width: { xs: 80, lg: 96 }, minHeight: 96, flexShrink: 0, alignSelf: 'stretch' }}>
          <Avatar variant="square" src={project.image || undefined} alt={project.title}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', '& .MuiAvatar-img': { objectFit: 'cover' }, '& .MuiSvgIcon-root': { width: 32, height: 32 } }} />
        </Box>
        <Box sx={{
          flex: 1, minWidth: 0, display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.4fr) minmax(220px, 1fr)' },
          alignItems: 'center', gap: 2, p: 2, '& > *': { minWidth: 0 },
        }}>
          <Box>
            <Typography component={Link} to={`/project/${project.id}`} sx={{ color: 'inherit', fontWeight: 600 }}>{project.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</Typography>
          </Box>
          <Typography component={Link} to={`/teachers/${project.passport.id}`} variant="body2" sx={{ color: 'inherit' }}>{project.passport.title || 'Преподаватель'}</Typography>
          <Box>
            <Typography component={Link} to={`/places/${project.place.id}`} variant="body2" sx={{ color: 'inherit' }}>{project.place.title || 'Центр'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{project.place.address}</Typography>
          </Box>
          {meet ? <Box>
            <Typography component={Link} to={`/project/${project.id}#meet-${meet.id}`} variant="body2" sx={{ color: 'inherit' }}>{formatMoscowMeet(meet)}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {meet.duration != null && `${meet.duration} минут`}{meet.duration != null && meet.price != null && ' · '}{meet.price != null && `${meet.price} ₽`}
            </Typography>
          </Box> : <Typography variant="body2" color="text.secondary">Ближайшая встреча не назначена</Typography>}
          <Box>
            <Typography variant="caption" color="text.secondary">Участники проекта</Typography>
            {project.users.length ? <AvatarGroupUsers users={project.users} limit={10} /> : <Typography variant="body2" color="text.secondary">Пока нет участников</Typography>}
          </Box>
        </Box>
      </Box>;
    })}
  </Stack>;
}
