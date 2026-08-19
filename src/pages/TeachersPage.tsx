import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import MessageIcon from '@mui/icons-material/Message';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacher } from '../requests.ts';
import ChatDialog from '../components/ChatDialog';
import Projects from '../features/project/ui/Projects.tsx';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import IdeaGrids from '../features/idea/ui/IdeaGrids.tsx';
import Title from '../shared/ui/Title.tsx';
import PlaceCard from '../features/place/PlaceCard.tsx';

const TeachersPage: React.FC = () => {
  const filter = useFilters();
  const { id } = useParams<{ id: string }>();
  const [chatOpen, setChatOpen] = useState(false);
  const handleStartChat = () => {
    setChatOpen(true);
  };

  const { data: teacher, refetch } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => fetchTeacher(Number(id)),
    enabled: Boolean(id),
  });

  if (!teacher) return <Typography>Teacher not found</Typography>;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardMedia component="img" height="300" image={teacher.passport.image || '/placeholder.jpg'} alt={teacher.passport.title} />
            <CardContent>
              <Typography variant="h4">{teacher.passport.title}</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {teacher.passport.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="contained" startIcon={<MessageIcon />} onClick={handleStartChat}>
                  Написать
                </Button>
                <Button variant="outlined" startIcon={<ShareIcon />}>
                  Поделиться
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Статистика
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="h6">Проекты</Typography>
                  <Typography variant="h4">{teacher.projects.length}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="h6">Ученики</Typography>
                  <Typography variant="h4">{teacher.students}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="h6">Встречи</Typography>
                  <Typography variant="h4">{teacher.meets}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="h6">Центры</Typography>
                  <Typography variant="h4">{teacher.centersCount}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Centers */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Центры работы
              </Typography>
              <Grid container spacing={2}>
                {teacher.centers.map(place => (
                  <Grid size={{ xs: 12, sm: 6 }} key={place.id}>
                    <PlaceCard place={place} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Projects title="Проекты учителя" filter={filter} projects={teacher.projects} refetch={refetch} withoutIdea />

      <Title text="Идеи учителя" />
      <IdeaGrids ideas={teacher.ideas} />

      <ChatDialog open={chatOpen} teacherId={teacher.passport.id} onClose={() => setChatOpen(false)} />
    </Box>
  );
};

export default TeachersPage;
