import { meetingPrice } from './meeting-price.ts';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import type { ProjectDto } from 'entities';
import { formatMoscowMeet, upcomingPublishedMeets } from './project-card-meeting.ts';
import ProjectImage from '../../../components/ProjectImage.tsx';


const clamp = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as const;

export default function ProjectShowcaseCard({ project }: { project: ProjectDto }) {
  const meet = upcomingPublishedMeets(project.meets)[0];
  const place = meet?.place ?? project.place;
  return <Card component="article" sx={{ height: '100%', minWidth: 0, overflowWrap: 'anywhere' }}>
    <Box component={Link} to={`/project/${project.id}`} aria-label={`Открыть проект «${project.title}»`}
      sx={{ display: 'block' }}>
      <ProjectImage src={project.image} />
    </Box>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography component={Link} to={`/project/${project.id}`} variant="h6" sx={{ ...clamp, color: 'inherit', textDecoration: 'none' }}>{project.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={clamp}>{project.description}</Typography>
      <Typography component={Link} to={`/teachers/${project.passport.id}`} variant="body2" sx={{ color: 'inherit' }}>{project.passport.title || 'Преподаватель'}</Typography>
      <Box>
        <Typography component={Link} to={`/places/${place.id}`} variant="body2" sx={{ color: 'inherit' }}>{place.title || 'Центр'}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{place.address}</Typography>
      </Box>
      {meet ? <Box>
        <Typography component={Link} to={`/project/${project.id}#meet-${meet.id}`} variant="body2" sx={{ color: 'inherit' }}>{formatMoscowMeet(meet)}</Typography>
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>{meetingPrice(meet.price)}</Typography>
      </Box> : <Typography variant="body2">Ближайшая встреча не назначена</Typography>}
    </CardContent>
  </Card>;
}
