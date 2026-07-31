import React from 'react';
import Grid from '@mui/material/Grid'; // Grid version 2
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useQuery } from '@tanstack/react-query';
import { fetchUserDashboard } from '../../requests.ts';
import ProjectCard from '../../features/project/ui/ProjectCard.tsx';

const UserHomePage: React.FC = () => {
  // Запрос активных проектов текущего пользователя
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['userProjects'],
    queryFn: fetchUserDashboard,
  });

  if(!user) return null;

  return (
    <Grid container spacing={3}>
      {/* Секция: Следующее действие */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Следующее действие
          </Typography>
          <Typography variant="body1">Здесь будет отображаться следующее запланированное действие (встреча, сообщение и т.д.)</Typography>
        </Box>
      </Grid>

      {/* Секция: Ближайшая встреча */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ближайшая встреча
          </Typography>
          <Typography variant="body1">Информация о ближайшей встрече появится здесь</Typography>
        </Box>
      </Grid>

      {/* Секция: Активные проекты */}
      <Grid size={12}>
        <Box
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Мои активные проекты
          </Typography>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">Ошибка при загрузке проектов</Alert>
          ) : user.projects && user.projects.length > 0 ? (
            <Grid container spacing={2}>
              {user.projects.slice(0, 3).map(project => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                  <ProjectCard project={project}/>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1">У вас пока нет активных проектов</Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default UserHomePage;