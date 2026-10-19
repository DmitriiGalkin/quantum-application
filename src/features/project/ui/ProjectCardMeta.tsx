import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import type { MeetDto, ProjectDto } from 'entities';
import CardTeacherLine from '../../../components/CardTeacherLine.tsx';
import CardVenueLine from '../../../components/CardVenueLine.tsx';

interface Props {
  project: ProjectDto;
  meet?: MeetDto;
  action?: ReactNode;
}

export default function ProjectCardMeta({ project, meet, action }: Props) {
  const place = meet?.place ?? project.place;
  const room = meet ? meet.location : project.location;
  return <Stack spacing={1} sx={{ borderTop: 1, borderColor: 'divider', px: 2, py: 1.5 }}>
    <CardTeacherLine id={project.passport.id} title={project.passport.title}
      image={project.passport.image} action={action} />
    <CardVenueLine id={place.id} title={place.title || 'Центр не указан'}
      address={place.address} room={room?.title} />
  </Stack>;
}
