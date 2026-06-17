import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchPassportProjects } from '../requests.ts';
import CreateProjectBlock from '../components/CreateProjectBlock.tsx';
import Page from '../components/Page.tsx';
import { groupProjectsByIdea } from '../utils/helper.ts';
import ProjectListItem from '../components/ProjectListItem.tsx';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { CardActions, CardContent, Divider } from '@mui/material';
import Button from '@mui/material/Button';

function PassportProjectsPage() {
  const { id } = useParams();
  const userId = id ? Number(id) : undefined;

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchPassportProjects(),
  });
  const groupes = groupProjectsByIdea(projects);

  return (
    <Page>
      <Box component="section">
        {isProjectsLoading && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <CircularProgress size={24} />
            <Typography>Загрузка проектов...</Typography>
          </Stack>
        )}

        {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

        {!isProjectsLoading && !isProjectsError && Boolean(groupes.length) && (
          <Stack spacing={2}>
            {groupes.map(({ idea, projects }) => (
              <Card>
                <Box sx={{ display: 'flex' }}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: 300,
                      height: 120,
                      objectFit: 'cover',
                      flexShrink: 0, // 🔥 важно!
                    }}
                    image={idea.image || `/bg.jpeg`}
                    alt={idea.title || 'Идея'}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h3">{idea.title}</Typography>
                    <Typography>{idea.description}</Typography>
                  </CardContent>
                </Box>
                <CardContent>
                  <List>
                    {projects.map((project, index) => (
                      <>
                        {index !== 0 && <Divider />}
                        <ProjectListItem project={project} withoutPassport />
                      </>
                    ))}
                  </List>
                </CardContent>
                <CardActions>
                  <Button href={`/chat?target=project&ideaId=${idea.id}`}>Создать новый проект по идее</Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}

        {!isProjectsLoading && !isProjectsError && !projects.length && <CreateProjectBlock />}
      </Box>
    </Page>
  );
}

export default PassportProjectsPage;
//
//
// sm: 'repeat(2, minmax(0, 1fr))',
//   md: 'repeat(3, minmax(0, 1fr))',
