import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import MessageIcon from '@mui/icons-material/Message';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacher } from '../requests.ts';
import ProjectCard from '../features/project/ProjectCard';
import IdeaCard from '../features/idea/ui/IdeaCard';
import ChatDialog from '../components/ChatDialog';

const TeacherPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [chatOpen, setChatOpen] = useState(false);
  const handleStartChat = () => {
    setChatOpen(true);
  };

  const { data: teacher } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => fetchTeacher(Number(id)),
    enabled: Boolean(id),
  });

  if (!teacher) return <Typography>Teacher not found</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      {/* Teacher Header */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={teacher.passport.image || '/placeholder.jpg'}
              alt={teacher.passport.title}
            />
            <CardContent>
              <Typography variant="h4">{teacher.passport.title}</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {teacher.passport.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button 
                  variant="contained" 
                  startIcon={<MessageIcon />}
                  onClick={handleStartChat}
                >
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
      <Grid size={{ xs: 6, md: 8 }}>
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
              <Grid  size={{ xs: 6, sm: 3 }}>
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
            {teacher.centers.map(center => (
<Grid size={{ xs: 12, sm: 6 }} key={center.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={center.image || '/placeholder.jpg'}
                    alt={center.title || 'Center'}
                  />
                  <CardContent>
                    <Typography variant="h6">{center.title}</Typography>
                    <Typography variant="body2">{center.address}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
        </Grid>
      </Grid>

      {/* Projects */}
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Проекты учителя
      </Typography>
      <Grid container spacing={3}>
        {teacher.projects.map(project => (
          <Grid size={{ xs: 12, md: 3 }} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>

      {/* Ideas */}
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Идеи учителя
      </Typography>
<Grid container spacing={3}>
  {teacher.ideas.map(idea => (
    <Grid size={{ xs: 12, md: 3 }} key={idea.id}>
      <IdeaCard idea={idea} />
    </Grid>
  ))}
</Grid>
      
      <ChatDialog
        open={chatOpen}
        teacherId={teacher.passport.id}
        onClose={() => setChatOpen(false)}
      />
    </Box>
  );
};

export default TeacherPage;