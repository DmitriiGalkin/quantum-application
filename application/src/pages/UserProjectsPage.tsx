import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProjects } from '../requests.ts';
import Page from '../components/Page.tsx';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { CardContent, Divider } from '@mui/material';
import List from '@mui/material/List';
import MeetListItem from '../components/MeetListItem.tsx';

function UserProjectsPage() {
  const { id } = useParams();
  const userId = id ? Number(id) : undefined;

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchUserProjects(userId!),
  });

  return (
    <Page isLoading={isProjectsLoading}>
      <Box component="section">

        {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

        {!isProjectsLoading && !isProjectsError && Boolean(projects.length) && (
          <Stack spacing={2}>
            {projects.map(({ idea, meets }) => (
              <Card sx={{ display: 'flex' }}>
                <Box sx={{ width: 300 }}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: 300,
                      height: 120,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                    image={idea.image || `/bg.jpeg`}
                    alt={idea.title || 'Идея'}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5">{idea.title}</Typography>
                    <Typography>{idea.description}</Typography>
                  </CardContent>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <List>
                    {meets?.map((meet, index) => (
                      <>
                        {index !== 0 && <Divider />}
                        <MeetListItem meet={meet} />
                      </>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Page>
  );
}

export default UserProjectsPage;
