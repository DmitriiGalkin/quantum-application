import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Card, CardActionArea, Stack } from '@mui/material';
import { type ProjectExtendedDto } from '@shared/types';
import PlaceIcon from '@mui/icons-material/Place';
import MeetForPassport from './TeacherIdeaProjectMeetCard.tsx';
import CardContent from '@mui/material/CardContent';

type Props = {
  project: ProjectExtendedDto; // частичное должно быть
  refetch?: any;
};

function TeacherIdeaProjectCard({ project }: Props) {

  const nextMeet = project.meets?.[0];

  const projectTitle = project.place?.address ? `Проект на ${project.place.address}` : 'Проект без адреса';

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      {/* LOCATION */}
      <CardActionArea href={`/project/${project.id}`} sx={{ borderRadius: 0 }}>
        <CardContent>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <PlaceIcon sx={{ fontSize: 16, opacity: 0.6 }} />
            <Typography
              component="div"
              variant="subtitle2"
              sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {projectTitle}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      {/* MEET */}
      {nextMeet ? (
        <MeetForPassport meet={nextMeet} isNextMeet />
      ) : (
        <Stack spacing={2} sx={{ px: 2, pb: 2, mt: 1 }}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Встреч пока нет
            </Typography>
          </Box>
          <Button size="small" variant="contained">
            Создать встречу
          </Button>
        </Stack>
      )}
    </Card>
  );
}

export default TeacherIdeaProjectCard;
